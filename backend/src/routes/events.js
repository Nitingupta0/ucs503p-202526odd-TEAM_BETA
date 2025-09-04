const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getRecommendedEvents,
  registerForEvent,
  unregisterFromEvent,
  getUpcomingEvents
} = require('../controllers/eventController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { 
  validateEvent, 
  validateEventQuery, 
  validateObjectId 
} = require('../middleware/validation');

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, validateEventQuery, getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:id', validateObjectId, getEvent);

// Private routes
router.use(authenticate);
router.get('/recommended', getRecommendedEvents);
router.post('/:id/register', validateObjectId, registerForEvent);
router.post('/:id/unregister', validateObjectId, unregisterFromEvent);

// Admin only routes
router.post('/', authorize('admin'), validateEvent, createEvent);
router.put('/:id', authorize('admin'), validateObjectId, validateEvent, updateEvent);
router.delete('/:id', authorize('admin'), validateObjectId, deleteEvent);

module.exports = router;
