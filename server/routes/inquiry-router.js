/**
 * Inquiry API Routes
 * Handles customer inquiries via WhatsApp and other channels
 */

const express = require('express');
const router = express.Router();
const db = require('../db/index');
const whatsappService = require('../services/whatsapp-service');
const emailService = require('../db/email-service');

/**
 * POST /api/inquiries/create
 * Create a new customer inquiry
 * Body: { name, email, phone, subject, message, source, preferredContact }
 */
router.post('/create', async (req, res) => {
  try {
    const { name, email, phone, subject, message, source = 'web', preferredContact = 'email' } = req.body;

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and message are required'
      });
    }

    // Save inquiry to database
    const result = await db.query(
      `INSERT INTO inquiries (name, email, phone, subject, message, source, preferred_contact, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', NOW())
       RETURNING id, name, email, phone, subject, message, source, preferred_contact, status, created_at`,
      [name, email, phone, subject || 'Customer Inquiry', message, source, preferredContact]
    );

    const inquiry = result.rows[0];

    // Send confirmation to customer
    if (preferredContact === 'whatsapp' && phone) {
      await whatsappService.sendMessage(
        phone,
        `👋 *Thanks for contacting VSP Electronics!*\n\nWe received your inquiry:\n"${message}"\n\nOur team will respond shortly.\n\nInquiry ID: ${inquiry.id}`,
        'text'
      );
    } else {
      // Send email confirmation
      await sendInquiryConfirmationEmail(email, inquiry);
    }

    // Notify admin
    await notifyAdminAboutInquiry(inquiry);

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. We will get back to you soon!',
      data: {
        inquiryId: inquiry.id,
        status: inquiry.status
      }
    });

  } catch (error) {
    console.error('Error creating inquiry:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error submitting inquiry',
      error: error.message
    });
  }
});

/**
 * POST /api/inquiries/:inquiryId/respond
 * Respond to an inquiry (Admin)
 * Body: { response, notifyVia }
 */
router.post('/:inquiryId/respond', async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { response, notifyVia = 'all' } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    // Get inquiry details
    const inquiryResult = await db.query(
      'SELECT * FROM inquiries WHERE id = $1',
      [inquiryId]
    );

    if (inquiryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    const inquiry = inquiryResult.rows[0];

    // Save response to database
    await db.query(
      `INSERT INTO inquiry_responses (inquiry_id, response, responded_by, responded_at)
       VALUES ($1, $2, $3, NOW())`,
      [inquiryId, response, 'admin'] // Could be enhanced to track which admin
    );

    // Update inquiry status to responded
    await db.query(
      'UPDATE inquiries SET status = $1, updated_at = NOW() WHERE id = $2',
      ['responded', inquiryId]
    );

    // Send response via preferred contact method
    if ((notifyVia === 'whatsapp' || notifyVia === 'all') && inquiry.preferred_contact === 'whatsapp') {
      const whatsappResult = await whatsappService.sendInquiryResponse(
        inquiry.phone,
        inquiry,
        response
      );
      console.log('WhatsApp notification:', whatsappResult);
    }

    if ((notifyVia === 'email' || notifyVia === 'all')) {
      const emailResult = await sendInquiryResponseEmail(inquiry.email, inquiry, response);
      console.log('Email notification:', emailResult);
    }

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: {
        inquiryId: inquiry.id,
        status: 'responded'
      }
    });

  } catch (error) {
    console.error('Error responding to inquiry:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error sending response',
      error: error.message
    });
  }
});

/**
 * GET /api/inquiries
 * Get all inquiries (Admin)
 * Query: ?status=open&limit=50&offset=0
 */
router.get('/', async (req, res) => {
  try {
    const status = req.query.status || null;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    let query = 'SELECT * FROM inquiries WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM inquiries WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ' AND status = $' + (countParams.length + 1);
      countParams.push(status);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      message: 'Inquiries retrieved',
      data: {
        inquiries: result.rows,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching inquiries:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving inquiries',
      error: error.message
    });
  }
});

/**
 * GET /api/inquiries/:inquiryId
 * Get specific inquiry details
 */
router.get('/:inquiryId', async (req, res) => {
  try {
    const { inquiryId } = req.params;

    // Get inquiry
    const inquiryResult = await db.query(
      'SELECT * FROM inquiries WHERE id = $1',
      [inquiryId]
    );

    if (inquiryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Get responses
    const responsesResult = await db.query(
      'SELECT * FROM inquiry_responses WHERE inquiry_id = $1 ORDER BY responded_at DESC',
      [inquiryId]
    );

    const inquiry = inquiryResult.rows[0];
    inquiry.responses = responsesResult.rows;

    res.json({
      success: true,
      message: 'Inquiry retrieved successfully',
      data: inquiry
    });

  } catch (error) {
    console.error('Error fetching inquiry:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving inquiry',
      error: error.message
    });
  }
});

/**
 * WhatsApp Webhook - Receive incoming WhatsApp messages
 * POST /api/inquiries/webhook/whatsapp
 */
router.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      return res.json({ received: true });
    }

    const message = messages[0];
    const senderPhone = message.from;
    const messageText = message.text?.body || '';
    const customerName = message.profile?.name || 'Customer';

    console.log(`📱 WhatsApp message received from ${senderPhone}: ${messageText}`);

    // Check if customer exists
    let customer = await db.query(
      'SELECT * FROM users WHERE phone = $1',
      [senderPhone]
    );

    // Create or get inquiry
    const inquiryResult = await db.query(
      `INSERT INTO inquiries (name, email, phone, subject, message, source, preferred_contact, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'whatsapp', 'whatsapp', 'open', NOW())
       ON CONFLICT (phone, created_at) DO UPDATE SET message = $5
       RETURNING id, name, email, phone, subject, message, source, preferred_contact, status`,
      [
        customerName,
        customer.rows[0]?.email || `${senderPhone}@whatsapp.vsp`,
        senderPhone,
        'WhatsApp Inquiry',
        messageText
      ]
    );

    const inquiry = inquiryResult.rows[0];

    // Send acknowledgment
    await whatsappService.sendMessage(
      senderPhone,
      `👋 Thanks for reaching out! Your inquiry ID is: ${inquiry.id}\n\nOur team will respond shortly. ⏳`,
      'text'
    );

    // Notify admin
    await notifyAdminAboutInquiry(inquiry);

    res.json({
      success: true,
      received: true,
      inquiryId: inquiry.id
    });

  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error.message);
    res.json({ received: false, error: error.message });
  }
});

/**
 * Helper function: Send inquiry confirmation email
 */
async function sendInquiryConfirmationEmail(email, inquiry) {
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #2c3e50; margin-bottom: 30px; }
        .inquiry-box { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
        .reference { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Inquiry Received</h2>
        </div>
        
        <p>Hi ${inquiry.name},</p>
        <p>Thank you for contacting VSP Electronics! We've received your inquiry and our team will respond shortly.</p>
        
        <div class="reference">
          <p style="margin: 0;">Reference ID: <strong>${inquiry.id}</strong></p>
        </div>
        
        <div class="inquiry-box">
          <h4 style="margin-top: 0;">Your Message:</h4>
          <p>"${inquiry.message}"</p>
        </div>
        
        <p>We typically respond to inquiries within 24 hours during business days. You'll receive a reply via email.</p>
        
        <p style="color: #666; font-size: 14px;">
          Need urgent assistance? Call us or visit our website at ${process.env.FRONTEND_URL || 'http://localhost:4200'}
        </p>
        
        <div class="footer">
          <p>© 2024 VSP Electronics. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return emailService.sendCustomEmail(email, 'Inquiry Confirmation', emailTemplate);
}

/**
 * Helper function: Send inquiry response email
 */
async function sendInquiryResponseEmail(email, inquiry, responseMessage) {
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #2c3e50; margin-bottom: 30px; }
        .response-box { background: #f0f7ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📝 We've Replied to Your Inquiry</h2>
        </div>
        
        <p>Hi ${inquiry.name},</p>
        <p>Thank you for your patience! Here's our response to your inquiry:</p>
        
        <div class="response-box">
          <h4 style="margin-top: 0;">Response:</h4>
          <p>${responseMessage}</p>
          <p style="font-size: 12px; color: #666; margin-bottom: 0;">Reference ID: ${inquiry.id}</p>
        </div>
        
        <p>If you have any further questions, please feel free to reach out to us.</p>
        
        <p style="color: #666; font-size: 14px;">
          Support Email: support@vspelectronics.com
        </p>
        
        <div class="footer">
          <p>© 2024 VSP Electronics. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return emailService.sendCustomEmail(email, 'Response to Your Inquiry', emailTemplate);
}

/**
 * Helper function: Notify admin about new inquiry
 */
async function notifyAdminAboutInquiry(inquiry) {
  try {
    // Get admin email from config
    const configResult = await db.query(
      "SELECT config_value FROM email_config WHERE config_key = 'ADMIN_EMAIL' AND is_active = true"
    );

    if (configResult.rows.length === 0) {
      console.warn('⚠️  Admin email not configured');
      return;
    }

    const adminEmail = configResult.rows[0].config_value;

    const emailTemplate = `
      <h3>New Customer Inquiry - ${inquiry.subject}</h3>
      <p><strong>From:</strong> ${inquiry.name} (${inquiry.email})</p>
      <p><strong>Phone:</strong> ${inquiry.phone}</p>
      <p><strong>Source:</strong> ${inquiry.source}</p>
      <p><strong>Inquiry ID:</strong> ${inquiry.id}</p>
      <p><strong>Message:</strong></p>
      <p>${inquiry.message}</p>
      <p><a href="${process.env.BACKEND_URL || 'http://localhost:3000'}/admin/inquiries/${inquiry.id}">View in Admin Panel</a></p>
    `;

    return emailService.sendCustomEmail(adminEmail, `New Inquiry: ${inquiry.subject}`, emailTemplate);
  } catch (error) {
    console.error('Error notifying admin:', error.message);
  }
}

module.exports = router;
