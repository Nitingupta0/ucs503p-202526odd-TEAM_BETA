const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getNearbyLocations,
  importLocations
} = require('../controllers/locationController');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  validateLocation, 
  validateLocationQuery, 
  validateObjectId 
} = require('../middleware/validation');

// Configure multer for CSV uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', validateLocationQuery, getLocations);
router.get('/nearby', validateLocationQuery, getNearbyLocations);
router.get('/:id', validateObjectId, getLocation);

// Admin only routes
router.use(authenticate);
router.use(authorize('admin'));

router.post('/', validateLocation, createLocation);
router.put('/:id', validateObjectId, validateLocation, updateLocation);
router.delete('/:id', validateObjectId, deleteLocation);
// Support both 'csv' and generic 'file' field names for CSV uploads
router.post('/import', (req, res, next) => {
  const handler = upload.single('csv');
  handler(req, res, function(err) {
    if (err) return next(err);
    if (!req.file) {
      // Try with 'file' field as fallback
      return upload.single('file')(req, res, next);
    }
    next();
  });
}, importLocations);

module.exports = router;
