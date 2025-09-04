const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Location type is required'],
    enum: ['building', 'room', 'poi'],
    lowercase: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null
  },
  floor: {
    type: mongoose.Schema.Types.Mixed, // Can be number or string
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
locationSchema.index({ coordinates: '2dsphere' });

// Compound indexes for common queries
locationSchema.index({ type: 1, tags: 1 });
locationSchema.index({ buildingId: 1, floor: 1 });
locationSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for getting locations within a building
locationSchema.virtual('roomsInBuilding', {
  ref: 'Location',
  localField: '_id',
  foreignField: 'buildingId'
});

// Method to get locations within a bounding box
locationSchema.statics.findWithinBounds = function(bounds) {
  const { north, south, east, west } = bounds;
  
  return this.find({
    'coordinates.lat': { $gte: south, $lte: north },
    'coordinates.lng': { $gte: west, $lte: east }
  });
};

// Method to find nearby locations
locationSchema.statics.findNearby = function(lat, lng, maxDistance = 1000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

module.exports = mongoose.model('Location', locationSchema);
