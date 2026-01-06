/**
 * WhatsApp Service
 * Sends notifications via WhatsApp using Twilio or Meta WhatsApp Business API
 */

const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.provider = process.env.WHATSAPP_PROVIDER || 'twilio'; // 'twilio' or 'meta'
    this.isConfigured = this.validateConfig();
  }

  /**
   * Validate WhatsApp configuration
   */
  validateConfig() {
    if (this.provider === 'twilio') {
      return !!(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.WHATSAPP_BUSINESS_NUMBER
      );
    } else if (this.provider === 'meta') {
      return !!(
        process.env.WHATSAPP_BUSINESS_PHONE_ID &&
        process.env.WHATSAPP_BUSINESS_API_TOKEN
      );
    }
    return false;
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(toPhoneNumber, message, messageType = 'text') {
    try {
      if (!this.isConfigured) {
        console.warn('⚠️  WhatsApp service not configured');
        return {
          success: false,
          message: 'WhatsApp service not configured'
        };
      }

      if (this.provider === 'twilio') {
        return await this.sendViatwilio(toPhoneNumber, message, messageType);
      } else if (this.provider === 'meta') {
        return await this.sendViaMeta(toPhoneNumber, message, messageType);
      }

      return { success: false, message: 'Unknown WhatsApp provider' };
    } catch (error) {
      console.error('WhatsApp error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Send via Twilio WhatsApp API
   */
  async sendViatwilio(toPhoneNumber, message, messageType) {
    try {
      const twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const result = await twilio.messages.create({
        from: `whatsapp:${process.env.WHATSAPP_BUSINESS_NUMBER}`,
        to: `whatsapp:${toPhoneNumber}`,
        body: message
      });

      console.log(`✅ WhatsApp message sent via Twilio to ${toPhoneNumber}`);
      
      return {
        success: true,
        message: 'WhatsApp message sent successfully',
        messageId: result.sid
      };
    } catch (error) {
      console.error('Twilio WhatsApp error:', error);
      throw error;
    }
  }

  /**
   * Send via Meta WhatsApp Business API
   */
  async sendViaMeta(toPhoneNumber, message, messageType) {
    try {
      const phoneId = process.env.WHATSAPP_BUSINESS_PHONE_ID;
      const token = process.env.WHATSAPP_BUSINESS_API_TOKEN;

      const response = await axios.post(
        `https://graph.instagram.com/v18.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: toPhoneNumber,
          type: messageType,
          [messageType]: {
            preview_url: true,
            body: message
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp message sent via Meta to ${toPhoneNumber}`);

      return {
        success: true,
        message: 'WhatsApp message sent successfully',
        messageId: response.data.messages[0].id
      };
    } catch (error) {
      console.error('Meta WhatsApp error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send Order Confirmation via WhatsApp
   */
  async sendOrderConfirmation(phoneNumber, orderData) {
    const message = `
🎉 *Order Confirmed!*

Order ID: ${orderData.orderId}
Amount: ₹${orderData.totalAmount.toFixed(2)}
Items: ${orderData.items.length}

📦 Estimated Delivery: ${new Date(orderData.estimatedDeliveryDate).toLocaleDateString('en-IN')}

Thank you for shopping with VSP Electronics!
    `;

    return await this.sendMessage(phoneNumber, message.trim(), 'text');
  }

  /**
   * Send Order Status Update via WhatsApp
   */
  async sendOrderStatusUpdate(phoneNumber, orderData, newStatus) {
    const statusMessages = {
      'processing': '⚙️ Your order is being prepared',
      'shipped': '📦 Your order has been shipped',
      'out_for_delivery': '🚚 Your order is out for delivery',
      'delivered': '✅ Your order has been delivered'
    };

    const message = `
📦 *Order Status Update*

Order ID: ${orderData.orderId}
Status: ${statusMessages[newStatus] || newStatus}

Track your order at: ${process.env.FRONTEND_URL || 'http://localhost:4200'}
    `;

    return await this.sendMessage(phoneNumber, message.trim(), 'text');
  }

  /**
   * Send Inquiry Response via WhatsApp
   */
  async sendInquiryResponse(phoneNumber, inquiryData, responseMessage) {
    const message = `
👋 *VSP Electronics - Inquiry Response*

Thank you for your inquiry!

*Your Question:* ${inquiryData.message}

*Response:*
${responseMessage}

For more details, visit: ${process.env.FRONTEND_URL || 'http://localhost:4200'}
    `;

    return await this.sendMessage(phoneNumber, message.trim(), 'text');
  }

  /**
   * Send Welcome Message
   */
  async sendWelcomeMessage(phoneNumber, customerName) {
    const message = `
👋 *Welcome to VSP Electronics!*

Hi ${customerName},

Thank you for choosing VSP Electronics. We're excited to serve you!

📱 You can now:
• Browse our products
• Track your orders
• Get support via WhatsApp
• Receive special offers

Start shopping: ${process.env.FRONTEND_URL || 'http://localhost:4200'}

Need help? Just reply to this message!
    `;

    return await this.sendMessage(phoneNumber, message.trim(), 'text');
  }
}

module.exports = new WhatsAppService();
