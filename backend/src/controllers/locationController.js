const Location = require('../models/Location');
const { asyncHandler } = require('../middleware/errorHandler');
const csv = require('csv-parser');
const fs = require('fs');

/**
 * @desc    Get all locations
 * @route   GET /api/locations
 * @access  Public
 */
const getLocations = asyncHandler(async (req, res) => {
  const { q, type, north, south, east, west, limit = 100, page = 1 } = req.query;
  
  let query = {};
  
  // Text/regex search: use full-text for queries >=3 chars, regex fallback for short queries
    if (q) {
      const qStr = String(q).trim();
      // Use text search for queries with length >= 3 for better relevance,
      // otherwise fall back to case-insensitive regex to match short strings.
      if (qStr.length >= 3) {
        query.$text = { $search: qStr };
      } else if (qStr.length > 0) {
        query.$or = [
          { name: { $regex: qStr, $options: 'i' } },
          { description: { $regex: qStr, $options: 'i' } },
          { tags: { $elemMatch: { $regex: qStr, $options: 'i' } } }
        ];
    }
  }
  
  // Filter by type
  if (type) {
    query.type = type;
  }
  
  // Bounding box filter
  if (north && south && east && west) {
    query['coordinates.lat'] = { $gte: parseFloat(south), $lte: parseFloat(north) };
    query['coordinates.lng'] = { $gte: parseFloat(west), $lte: parseFloat(east) };
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const usingTextSearch = Boolean(q && String(q).trim().length >= 3);

  const locations = await Location.find(query)
    .populate('buildingId', 'name type')
    .sort(usingTextSearch ? { score: { $meta: 'textScore' } } : { name: 1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Location.countDocuments(query);
  
  res.json({
    success: true,
    data: {
      locations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

/**
 * @desc    Get single location
 * @route   GET /api/locations/:id
 * @access  Public
 */
const getLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id)
    .populate('buildingId', 'name type coordinates')
    .populate('roomsInBuilding', 'name type floor');
  
  if (!location) {
    return res.status(404).json({
      success: false,
      message: 'Location not found'
    });
  }
  
  res.json({
    success: true,
    data: { location }
  });
});

/**
 * @desc    Create location
 * @route   POST /api/locations
 * @access  Private (Admin only)
 */
const createLocation = asyncHandler(async (req, res) => {
  const location = await Location.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Location created successfully',
    data: { location }
  });
});

/**
 * @desc    Update location
 * @route   PUT /api/locations/:id
 * @access  Private (Admin only)
 */
const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!location) {
    return res.status(404).json({
      success: false,
      message: 'Location not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Location updated successfully',
    data: { location }
  });
});

/**
 * @desc    Delete location
 * @route   DELETE /api/locations/:id
 * @access  Private (Admin only)
 */
const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  
  if (!location) {
    return res.status(404).json({
      success: false,
      message: 'Location not found'
    });
  }
  
  await location.deleteOne();
  
  res.json({
    success: true,
    message: 'Location deleted successfully'
  });
});

/**
 * @desc    Get nearby locations
 * @route   GET /api/locations/nearby
 * @access  Public
 */
const getNearbyLocations = asyncHandler(async (req, res) => {
  const { lat, lng, maxDistance = 1000 } = req.query;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const maxDist = parseInt(maxDistance);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates'
    });
  }

  try {
    const locations = await Location.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDist
        }
      }
    });

    return res.json({ success: true, data: { locations } });
  } catch (err) {
    // Fallback: approximate by bounding box if 2dsphere index not available
    const degPerMeter = 1 / 111320; // rough
    const latDelta = maxDist * degPerMeter;
    const lngDelta = maxDist * (1 / (111320 * Math.cos((latitude * Math.PI) / 180)));
    const locations = await Location.find({
      'coordinates.lat': { $gte: latitude - latDelta, $lte: latitude + latDelta },
      'coordinates.lng': { $gte: longitude - lngDelta, $lte: longitude + lngDelta }
    }).limit(200);
    return res.json({ success: true, data: { locations } });
  }
});

/**
 * @desc    Import locations from CSV
 * @route   POST /api/locations/import
 * @access  Private (Admin only)
 */
const importLocations = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'CSV file is required'
    });
  }
  
  const locations = [];
  const errors = [];
  
  return new Promise((_resolve, _reject) => {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row, index) => {
        try {
          // Validate required fields
          if (!row.name || !row.type || !row.lat || !row.lng) {
            errors.push(`Row ${index + 1}: Missing required fields (name, type, lat, lng)`);
            return;
          }
          
          // Parse coordinates
          const lat = parseFloat(row.lat);
          const lng = parseFloat(row.lng);
          
          if (isNaN(lat) || isNaN(lng)) {
            errors.push(`Row ${index + 1}: Invalid coordinates`);
            return;
          }
          
          // Validate type
          if (!['building', 'room', 'poi'].includes(row.type.toLowerCase())) {
            errors.push(`Row ${index + 1}: Invalid type (must be building, room, or poi)`);
            return;
          }
          
          // Parse tags
          const tags = row.tags ? row.tags.split(',').map(tag => tag.trim().toLowerCase()) : [];
          
          locations.push({
            name: row.name.trim(),
            description: row.description ? row.description.trim() : '',
            type: row.type.toLowerCase(),
            coordinates: { lat, lng },
            floor: row.floor || null,
            tags
          });
        } catch (error) {
          errors.push(`Row ${index + 1}: ${error.message}`);
        }
      })
      .on('end', async () => {
        try {
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
          
          if (errors.length > 0) {
            return res.status(400).json({
              success: false,
              message: 'CSV validation failed',
              errors
            });
          }
          
          if (locations.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'No valid locations found in CSV'
            });
          }
          
          // Insert locations
          const insertedLocations = await Location.insertMany(locations);
          
          res.status(201).json({
            success: true,
            message: `Successfully imported ${insertedLocations.length} locations`,
            data: {
              imported: insertedLocations.length,
              locations: insertedLocations
            }
          });
        } catch (error) {
          console.error('Import error:', error);
          res.status(500).json({
            success: false,
            message: 'Error importing locations',
            error: error.message
          });
        }
      })
      .on('error', (error) => {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
          success: false,
          message: 'Error reading CSV file',
          error: error.message
        });
      });
  });
});

module.exports = {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getNearbyLocations,
  importLocations
};
