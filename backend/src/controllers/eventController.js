const Event = require('../models/Event');
const Location = require('../models/Location');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all events
 * @route   GET /api/events
 * @access  Public
 */
const getEvents = asyncHandler(async (req, res) => {
  const { 
    q, 
    category, 
    startDate, 
    endDate, 
    locationId, 
    limit = 20, 
    page = 1,
    upcoming = false 
  } = req.query;
  
  let query = {};
  
  // Text/regex search: use full-text for queries >=3 chars, regex fallback for short queries
  if (q) {
    const qStr = String(q).trim();
    if (qStr.length >= 3) {
      query.$text = { $search: qStr };
    } else if (qStr.length > 0) {
      query.$or = [
        { title: { $regex: qStr, $options: 'i' } },
        { description: { $regex: qStr, $options: 'i' } },
        { tags: { $elemMatch: { $regex: qStr, $options: 'i' } } }
      ];
    }
  }
  
  // Filter by category
  if (category) {
    query.category = category;
  }
  
  // Filter by location
  if (locationId) {
    query.locationId = locationId;
  }
  
  // Date range filter
  if (startDate || endDate || upcoming) {
    query.dateTime = {};
    
    if (upcoming) {
      query.dateTime.$gte = new Date();
    } else {
      if (startDate) {
        query.dateTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.dateTime.$lte = new Date(endDate);
      }
    }
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const usingTextSearch = Boolean(q && String(q).trim().length >= 3);

  const events = await Event.find(query)
    .populate({
      path: 'location',
      select: 'name coordinates category'
    })
    .sort(usingTextSearch ? { score: { $meta: 'textScore' }, dateTime: 1 } : { dateTime: 1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Event.countDocuments(query);
  
  res.json({
    success: true,
    data: {
      events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

/**
 * @desc    Get single event
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate({
      path: 'location',
      select: 'name coordinates category description'
    })
    .populate('attendees.userId', 'name email');
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  res.json({
    success: true,
    data: { event }
  });
});

/**
 * @desc    Create event
 * @route   POST /api/events
 * @access  Private (Admin only)
 */
const createEvent = asyncHandler(async (req, res) => {
  // Verify location exists
  const location = await Location.findById(req.body.locationId);
  if (!location) {
    return res.status(400).json({
      success: false,
      message: 'Invalid location ID'
    });
  }
  
  const event = await Event.create(req.body);
  
  await event.populate({
    path: 'location',
    select: 'name coordinates type'
  });
  
  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: { event }
  });
});

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private (Admin only)
 */
const updateEvent = asyncHandler(async (req, res) => {
  // If updating location, verify it exists
  if (req.body.locationId) {
    const location = await Location.findById(req.body.locationId);
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location ID'
      });
    }
  }
  
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate({
    path: 'location',
    select: 'name coordinates type'
  });
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Event updated successfully',
    data: { event }
  });
});

/**
 * @desc    Delete event
 * @route   DELETE /api/events/:id
 * @access  Private (Admin only)
 */
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  await event.deleteOne();
  
  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
});

/**
 * @desc    Get recommended events for user
 * @route   GET /api/events/recommended
 * @access  Private
 */
const getRecommendedEvents = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  
  const userInterests = req.user?.interests || [];
  
  const events = await Event.getRecommendations(userInterests, parseInt(limit));
  
  res.json({
    success: true,
    data: {
      events,
      basedOn: userInterests.length > 0 ? 'your interests' : 'general recommendations'
    }
  });
});

/**
 * @desc    Register for event
 * @route   POST /api/events/:id/register
 * @access  Private
 */
const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  try {
    await event.registerUser(req.user._id);
    
    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: { 
        event,
        availableSpots: event.availableSpots
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Unregister from event
 * @route   DELETE /api/events/:id/register
 * @access  Private
 */
const unregisterFromEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  
  await event.unregisterUser(req.user._id);
  
  res.json({
    success: true,
    message: 'Successfully unregistered from event',
    data: { 
      event,
      availableSpots: event.availableSpots
    }
  });
});

/**
 * @desc    Get upcoming events
 * @route   GET /api/events/upcoming
 * @access  Public
 */
const getUpcomingEvents = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const events = await Event.findUpcoming(parseInt(limit));
  
  res.json({
    success: true,
    data: { events }
  });
});

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getRecommendedEvents,
  registerForEvent,
  unregisterFromEvent,
  getUpcomingEvents
};
