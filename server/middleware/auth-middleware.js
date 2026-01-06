const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate JWT token
 */
function generateToken(userId, email, role = 'user') {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to verify JWT token in Authorization header
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required. Use: Authorization: Bearer YOUR_TOKEN'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }

  req.user = decoded;
  next();
}

/**
 * Optional authentication - doesn't fail if no token
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

/**
 * Middleware to verify user is an admin
 * Must be used after authenticateToken
 */
function authenticateAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Check if user is admin by role or email
  const adminEmails = [
    'admin@vspelectronics.com',
    'admin@admin.com'
  ];

  const isAdminByEmail = adminEmails.includes(req.user.email);
  const isAdminByRole = req.user.role === 'admin';

  if (!isAdminByEmail && !isAdminByRole) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  optionalAuth,
  authenticateAdmin,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
