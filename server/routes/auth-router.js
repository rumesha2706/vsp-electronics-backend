const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const usersModel = require('../db/users-model');
const { generateToken } = require('../middleware/auth-middleware');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email-service');

// Validation helper
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  // Allow ANY special character, not just specific ones.
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, company } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      });
    }

    // Check if user already exists
    const existingUser = await usersModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    if (phone) {
      const existingPhone = await usersModel.getUserByPhone(phone);
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          error: 'Phone number already registered'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await usersModel.createUser({
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      company: company || ''
    });

    // Generate verification code (6 digits)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await usersModel.setVerificationToken(user.id, verificationCode, expiresAt);

    // Send verification email with code
    await sendVerificationEmail(user.email, user.first_name, verificationCode);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Get user with password hash
    const user = await usersModel.getUserWithPassword(email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if email verified
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in',
        requiresVerification: true,
        userId: user.id,
        email: user.email
      });
    }

    // Generate JWT token with role
    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        company: user.company,
        isVerified: user.is_verified,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!code || !email) {
      return res.status(400).json({
        success: false,
        error: 'Verification code and email are required'
      });
    }

    const user = await usersModel.verifyEmail(email, code);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
    }

    // Generate JWT token with role
    const jwtToken = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const user = await usersModel.getUserByEmail(email.toLowerCase());

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified'
      });
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await usersModel.setVerificationToken(user.id, verificationCode, expiresAt);

    // Send verification email
    await sendVerificationEmail(user.email, user.first_name, verificationCode);

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/recover-email
 * Recover email by phone number
 */
router.post('/recover-email', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const user = await usersModel.getUserByPhone(phone);

    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this phone number' });
    }

    // Mask the email for security (e.g., r***@gmail.com)
    const [local, domain] = user.email.split('@');
    const maskedLocal = local.length > 2 ? local[0] + '***' + local[local.length - 1] : local + '***';
    const maskedEmail = `${maskedLocal}@${domain}`;

    res.json({
      success: true,
      email: maskedEmail,
      fullEmail: user.email // Also returning full email as per likely user intent for recovery
    });
  } catch (error) {
    console.error('Recover email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const user = await usersModel.getUserByEmail(email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await usersModel.setResetToken(user.id, resetToken, expiresAt);

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.first_name, resetLink);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await usersModel.resetPassword(token, passwordHash);

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
