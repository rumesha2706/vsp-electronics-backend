/**
 * Static Data API Router
 * Endpoints for managing security, OAuth, email, and category configurations
 * ADMIN ONLY - These endpoints should be protected with authentication
 */

const express = require('express');
const router = express.Router();
const StaticDataModel = require('../db/static-data-model');

/**
 * GET /api/config/security
 * Get security configuration (reCAPTCHA, CSP, etc.)
 * @param {string} dataType - Optional filter (recaptcha, csp)
 */
router.get('/security', async (req, res) => {
  try {
    const config = await StaticDataModel.getSecurityConfig();
    if (!config) {
      return res.status(404).json({ message: 'Security configuration not found' });
    }
    res.json(config);
  } catch (error) {
    console.error('Error fetching security config:', error);
    res.status(500).json({ error: 'Failed to fetch security configuration' });
  }
});

/**
 * PUT /api/config/security
 * Update security configuration (ADMIN ONLY)
 */
router.put('/security', async (req, res) => {
  try {
    // Validate admin role in middleware
    const { recaptcha, csp, cors } = req.body;
    
    if (!recaptcha && !csp && !cors) {
      return res.status(400).json({ error: 'At least one configuration field required' });
    }

    const configData = {
      recaptcha: recaptcha || {},
      csp: csp || {},
      cors: cors || {}
    };

    const result = await StaticDataModel.updateSecurityConfig(configData);
    res.json({ message: 'Security configuration updated', data: result });
  } catch (error) {
    console.error('Error updating security config:', error);
    res.status(500).json({ error: 'Failed to update security configuration' });
  }
});

/**
 * GET /api/config/oauth
 * Get OAuth configuration
 */
router.get('/oauth', async (req, res) => {
  try {
    const config = await StaticDataModel.getOAuthConfig();
    if (!config) {
      return res.status(404).json({ message: 'OAuth configuration not found' });
    }
    // Don't return sensitive secrets to frontend
    const safeConfig = {
      authorizationEndpoint: config.authorizationEndpoint,
      tokenEndpoint: config.tokenEndpoint,
      userInfoEndpoint: config.userInfoEndpoint,
      scopes: config.scopes
      // clientId should be loaded from environment on backend
    };
    res.json(safeConfig);
  } catch (error) {
    console.error('Error fetching OAuth config:', error);
    res.status(500).json({ error: 'Failed to fetch OAuth configuration' });
  }
});

/**
 * PUT /api/config/oauth
 * Update OAuth configuration (ADMIN ONLY)
 */
router.put('/oauth', async (req, res) => {
  try {
    // Validate admin role in middleware
    const oauthData = req.body;
    
    if (!oauthData.authorizationEndpoint || !oauthData.tokenEndpoint) {
      return res.status(400).json({ error: 'Required OAuth configuration fields missing' });
    }

    const result = await StaticDataModel.updateOAuthConfig(oauthData);
    res.json({ message: 'OAuth configuration updated', data: result });
  } catch (error) {
    console.error('Error updating OAuth config:', error);
    res.status(500).json({ error: 'Failed to update OAuth configuration' });
  }
});

/**
 * GET /api/config/email
 * Get email configuration (non-sensitive parts only)
 */
router.get('/email', async (req, res) => {
  try {
    const config = await StaticDataModel.getEmailConfig();
    if (!config) {
      return res.status(404).json({ message: 'Email configuration not found' });
    }
    // Don't return passwords/sensitive data to frontend
    const safeConfig = {
      senderName: config.senderName,
      smtp: config.smtp
      // appPassword should never be sent to frontend
    };
    res.json(safeConfig);
  } catch (error) {
    console.error('Error fetching email config:', error);
    res.status(500).json({ error: 'Failed to fetch email configuration' });
  }
});

/**
 * PUT /api/config/email
 * Update email configuration (ADMIN ONLY - Backend only)
 */
router.put('/email', async (req, res) => {
  try {
    // Validate admin role in middleware
    const emailData = req.body;
    
    if (!emailData.senderEmail || !emailData.smtp) {
      return res.status(400).json({ error: 'Required email configuration fields missing' });
    }

    const result = await StaticDataModel.updateEmailConfig(emailData);
    res.json({ message: 'Email configuration updated', data: result });
  } catch (error) {
    console.error('Error updating email config:', error);
    res.status(500).json({ error: 'Failed to update email configuration' });
  }
});

/**
 * GET /api/config/categories/imports
 * Get category import configurations
 */
router.get('/categories/imports', async (req, res) => {
  try {
    const categoryImports = await StaticDataModel.getCategoryImports();
    res.json(categoryImports);
  } catch (error) {
    console.error('Error fetching category imports:', error);
    res.status(500).json({ error: 'Failed to fetch category imports' });
  }
});

/**
 * POST /api/config/categories/imports
 * Store category import configurations (ADMIN ONLY)
 */
router.post('/categories/imports', async (req, res) => {
  try {
    // Validate admin role in middleware
    const { categories } = req.body;
    
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'Categories array is required' });
    }

    // Validate category structure
    for (const category of categories) {
      if (!category.name || !category.slug) {
        return res.status(400).json({ error: 'Each category must have name and slug' });
      }
    }

    const result = await StaticDataModel.storeCategoryImports(categories);
    res.status(201).json({
      message: 'Category imports stored',
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Error storing category imports:', error);
    res.status(500).json({ error: 'Failed to store category imports' });
  }
});

/**
 * GET /api/config/all
 * Get all non-sensitive configuration (ADMIN ONLY)
 */
router.get('/all', async (req, res) => {
  try {
    // Validate admin role in middleware
    const security = await StaticDataModel.getSecurityConfig();
    const oauth = await StaticDataModel.getOAuthConfig();
    const categories = await StaticDataModel.getCategoryImports();

    res.json({
      security: security || {},
      oauth: oauth || {},
      categories: categories || []
    });
  } catch (error) {
    console.error('Error fetching all configs:', error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
});

module.exports = router;
