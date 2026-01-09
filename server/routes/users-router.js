const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require('../middleware/auth-middleware');
const usersModel = require('../db/users-model');

/**
 * GET /api/users/admin/all
 * Get all users (admin only)
 */
router.get('/admin/all', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const result = await usersModel.getAllUsers();
    res.json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

/**
 * POST /api/users/admin/create
 * Create a new user (admin only)
 */
router.post('/admin/create', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    console.log('Create user request from:', req.user.email, 'role:', req.user.role);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Hash the password
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await usersModel.createUser({
      email,
      passwordHash,
      firstName: firstName || '',
      lastName: lastName || ''
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);

    if (error.code === '23505') {
      // Unique violation error
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

/**
 * GET /api/users/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await usersModel.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, company, address, city, state, zipCode, country, profilePicture } = req.body;

    const updatedUser = await usersModel.updateUser(req.user.userId, {
      firstName,
      lastName,
      phone,
      company,
      address,
      city,
      state,
      zipCode,
      country,
      profilePicture
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: await usersModel.getUserById(req.user.userId)
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID (public profile)
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await usersModel.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const deletedUser = await usersModel.deleteUser(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    // Handle foreign key constraint violations
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete user because they have related data (orders, etc.)'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

module.exports = router;
