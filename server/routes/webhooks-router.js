/**
 * WhatsApp Webhook Routes
 * Receives and processes incoming WhatsApp messages
 * Integrates with Twilio or Meta WhatsApp Business API
 */

const express = require('express');
const router = express.Router();
const db = require('../db/index');
const crypto = require('crypto');

// Webhook token for verification
const WHATSAPP_WEBHOOK_TOKEN = process.env.WHATSAPP_WEBHOOK_TOKEN || 'your-webhook-token';

/**
 * GET /webhooks/whatsapp
 * Webhook verification endpoint (for Meta WhatsApp API)
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === WHATSAPP_WEBHOOK_TOKEN) {
      console.log('✅ WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      console.error('❌ Invalid webhook token');
      res.status(403).send('Forbidden');
    }
  } else {
    res.status(400).send('Bad Request');
  }
});

/**
 * POST /webhooks/whatsapp
 * Receive incoming WhatsApp messages
 */
router.post('/', async (req, res) => {
  try {
    const body = req.body;

    // Verify the request (for Meta API)
    if (process.env.WHATSAPP_PROVIDER === 'meta') {
      const signature = req.get('x-hub-signature-256');
      if (!verifySignature(req.rawBody, signature)) {
        console.error('❌ Invalid webhook signature');
        return res.status(403).send('Forbidden');
      }
    }

    // Quick response
    res.status(200).json({ received: true });

    // Process message asynchronously
    if (body.object === 'whatsapp_business_account') {
      await processWhatsAppMessage(body);
    }

  } catch (error) {
    console.error('Error processing webhook:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
});

/**
 * Process incoming WhatsApp message
 */
async function processWhatsAppMessage(body) {
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messageData = changes?.value;

    if (!messageData || !messageData.messages || messageData.messages.length === 0) {
      return;
    }

    const message = messageData.messages[0];
    const contact = messageData.contacts?.[0];
    const senderPhone = message.from;
    const customerName = contact?.profile?.name || 'Customer';
    const messageType = message.type;
    let messageContent = '';

    // Extract message content based on type
    if (messageType === 'text') {
      messageContent = message.text?.body || '';
    } else if (messageType === 'button') {
      messageContent = message.button?.text || '';
    } else if (messageType === 'interactive') {
      messageContent = message.interactive?.button_reply?.title || '';
    }

    console.log(`📱 WhatsApp Message from ${senderPhone} (${customerName}): ${messageContent}`);

    // Check if this is from a registered user
    let user = null;
    const userResult = await db.query(
      'SELECT * FROM users WHERE phone = $1',
      [senderPhone]
    );

    if (userResult.rows.length > 0) {
      user = userResult.rows[0];
    }

    // Determine the intent and respond
    const intent = detectMessageIntent(messageContent.toLowerCase());

    // Route the message
    await routeWhatsAppMessage(senderPhone, customerName, messageContent, intent, user);

  } catch (error) {
    console.error('Error in processWhatsAppMessage:', error.message);
  }
}

/**
 * Detect the intent of the WhatsApp message
 */
function detectMessageIntent(message) {
  const keywords = {
    inquiry: ['hello', 'hi', 'help', 'support', 'question', 'ask', 'info', 'information', 'product', 'price', 'availability'],
    order_status: ['status', 'order', 'tracking', 'delivered', 'shipped', 'where', 'track', 'when'],
    product_details: ['product', 'details', 'specs', 'specification', 'feature', 'price', 'cost'],
    complaint: ['complaint', 'issue', 'problem', 'broken', 'damaged', 'not working', 'return'],
    feedback: ['feedback', 'review', 'rating', 'experience', 'satisfied']
  };

  for (const [intent, words] of Object.entries(keywords)) {
    if (words.some(word => message.includes(word))) {
      return intent;
    }
  }

  return 'general_inquiry';
}

/**
 * Route WhatsApp message to appropriate handler
 */
async function routeWhatsAppMessage(phoneNumber, name, message, intent, user) {
  try {
    const whatsappService = require('../services/whatsapp-service');

    let response = '';

    switch (intent) {
      case 'order_status':
        if (user && user.id) {
          response = await handleOrderStatusQuery(user.id, phoneNumber);
        } else {
          response = `👋 Hi ${name}!\n\nTo check your order status, please log in to your account or provide your order number.`;
        }
        break;

      case 'product_details':
        response = `📦 For product details, please visit our website or send us the product name/SKU.\n\nWebsite: ${process.env.FRONTEND_URL || 'http://localhost:4200'}`;
        break;

      case 'complaint':
        response = await handleComplaint(phoneNumber, name, message);
        break;

      case 'inquiry':
      case 'general_inquiry':
      default:
        response = await handleGeneralInquiry(phoneNumber, name, message, user);
    }

    // Send response
    if (response) {
      await whatsappService.sendMessage(phoneNumber, response, 'text');
    }

  } catch (error) {
    console.error('Error routing message:', error.message);
  }
}

/**
 * Handle order status query
 */
async function handleOrderStatusQuery(userId, phoneNumber) {
  try {
    const result = await db.query(
      `SELECT id, order_number, status, created_at FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return 'You have no orders yet. Start shopping now! 🛍️';
    }

    const order = result.rows[0];
    const statusEmoji = {
      'pending': '⏳',
      'processing': '⚙️',
      'shipped': '📦',
      'out_for_delivery': '🚚',
      'delivered': '✅',
      'cancelled': '❌'
    };

    return `
📦 *Order Status Update*

Order #${order.order_number}
Status: ${statusEmoji[order.status] || '📦'} ${order.status.toUpperCase()}
Placed: ${new Date(order.created_at).toLocaleDateString('en-IN')}

Track online: ${process.env.FRONTEND_URL || 'http://localhost:4200'}/orders
    `.trim();

  } catch (error) {
    console.error('Error querying order status:', error.message);
    return 'Error retrieving your order status. Please try again later.';
  }
}

/**
 * Handle complaint
 */
async function handleComplaint(phoneNumber, name, message) {
  try {
    // Save complaint to database
    await db.query(
      `INSERT INTO inquiries (name, phone, subject, message, source, preferred_contact, status, created_at)
       VALUES ($1, $2, 'Complaint', $3, 'whatsapp', 'whatsapp', 'open', NOW())`,
      [name, phoneNumber, message]
    );

    return `
🛠️ *We're sorry to hear about your issue!*

Your complaint has been logged.
We'll contact you soon to resolve this.

Support Team
    `.trim();

  } catch (error) {
    console.error('Error saving complaint:', error.message);
    return 'Error recording your complaint. Please try again.';
  }
}

/**
 * Handle general inquiry
 */
async function handleGeneralInquiry(phoneNumber, name, message, user) {
  try {
    // Save inquiry
    const result = await db.query(
      `INSERT INTO inquiries (name, email, phone, subject, message, source, preferred_contact, status, created_at)
       VALUES ($1, $2, $3, 'WhatsApp Inquiry', $4, 'whatsapp', 'whatsapp', 'open', NOW())
       RETURNING id`,
      [
        name,
        user?.email || `${phoneNumber}@whatsapp.vsp`,
        phoneNumber,
        message
      ]
    );

    const inquiryId = result.rows[0].id;

    // Notify admin
    const configResult = await db.query(
      "SELECT config_value FROM email_config WHERE config_key = 'ADMIN_EMAIL' AND is_active = true LIMIT 1"
    );

    if (configResult.rows.length > 0) {
      const emailService = require('../db/email-service');
      await emailService.sendCustomEmail(
        configResult.rows[0].config_value,
        `New WhatsApp Inquiry from ${name}`,
        `<p>New inquiry from ${name} (${phoneNumber})</p><p>${message}</p><p>Inquiry ID: ${inquiryId}</p>`
      );
    }

    return `
👋 *Thank you for reaching out!*

Your inquiry ID: ${inquiryId}

We've received your message and our team will respond within 24 hours.

Have a great day! 😊
    `.trim();

  } catch (error) {
    console.error('Error handling inquiry:', error.message);
    return 'Thank you for your message. We will get back to you soon!';
  }
}

/**
 * Verify Meta webhook signature
 */
function verifySignature(body, signature) {
  if (!process.env.WHATSAPP_WEBHOOK_SECRET) {
    console.warn('⚠️  WHATSAPP_WEBHOOK_SECRET not configured');
    return true; // Skip verification if secret not configured
  }

  if (!signature) {
    return false;
  }

  const hash = crypto
    .createHmac('sha256', process.env.WHATSAPP_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('hex');

  const expectedSignature = `sha256=${hash}`;
  return signature === expectedSignature;
}

module.exports = router;
