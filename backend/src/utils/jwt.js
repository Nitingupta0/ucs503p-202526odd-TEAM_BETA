const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate CSRF token
 */
const generateCSRFToken = () => {
  return jwt.sign({ type: 'csrf' }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

/**
 * Verify CSRF token
 */
const verifyCSRFToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.type === 'csrf';
  } catch (error) {
    return false;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  generateCSRFToken,
  verifyCSRFToken
};
