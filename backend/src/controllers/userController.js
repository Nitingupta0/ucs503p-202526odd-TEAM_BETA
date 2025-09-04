const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, interests } = req.body;
  
  const updateData = {};
  
  if (name) updateData.name = name;
  if (interests !== undefined) updateData.interests = interests;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

/**
 * @desc    Get user's registered events
 * @route   GET /api/users/events
 * @access  Private
 */
const getUserEvents = asyncHandler(async (req, res) => {
  const Event = require('../models/Event');
  
  const events = await Event.find({
    'attendees.userId': req.user._id,
    dateTime: { $gte: new Date() }
  })
  .populate('locationId', 'name coordinates type')
  .sort({ dateTime: 1 });
  
  res.json({
    success: true,
    data: { events }
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/profile
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const Event = require('../models/Event');
  
  // Remove user from all event attendees
  await Event.updateMany(
    { 'attendees.userId': req.user._id },
    { $pull: { attendees: { userId: req.user._id } } }
  );
  
  // Delete user account
  await User.findByIdAndDelete(req.user._id);
  
  // Clear cookie
  res.clearCookie(process.env.COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getUserEvents,
  deleteAccount
};
