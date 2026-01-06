/**
 * Email Configuration and Sending Service
 * Reads email configuration from database
 * Uses Node.js nodemailer for SMTP email sending
 */

const db = require('./index.js');
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.config = null;
  }

  /**
   * Initialize email service by loading config from database
   */
  async initialize() {
    try {
      console.log('📧 Initializing Email Service...');
      
      // Load email configuration from database
      const configResult = await db.query(
        'SELECT config_key, config_value FROM email_config WHERE is_active = true'
      );

      if (configResult.rows.length === 0) {
        console.warn('⚠️  No email configuration found in database');
        return false;
      }

      // Convert to object
      this.config = {};
      configResult.rows.forEach(row => {
        this.config[row.config_key] = row.config_value;
      });

      // Create nodemailer transporter with Gmail SMTP
      this.transporter = nodemailer.createTransport({
        host: this.config.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(this.config.SMTP_PORT || '587'),
        secure: this.config.SMTP_SECURE === 'true' ? true : false,
        auth: {
          user: this.config.SENDER_EMAIL,
          pass: this.config.GMAIL_APP_PASSWORD
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email Service initialized successfully');
      console.log(`   From: ${this.config.SENDER_EMAIL}`);
      console.log(`   Name: ${this.config.SENDER_NAME}`);
      
      return true;
    } catch (error) {
      console.error('❌ Email Service initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to, verificationCode, userName, purpose = 'signup') {
    try {
      if (!this.transporter || !this.config) {
        console.warn('⚠️  Email service not initialized. Using console logging.');
        this.logEmailToConsole(to, verificationCode, userName, purpose);
        return {
          success: false,
          message: 'Email service not configured. Check console logs.',
          logged: true
        };
      }

      const emailTemplate = this.getVerificationEmailTemplate(
        verificationCode,
        userName,
        purpose
      );

      const mailOptions = {
        from: `"${this.config.SENDER_NAME}" <${this.config.SENDER_EMAIL}>`,
        to: to,
        subject: this.getEmailSubject(purpose),
        html: emailTemplate
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Verification email sent to ${to} (${purpose})`);
      
      return {
        success: true,
        message: 'Verification email sent successfully',
        messageId: result.messageId
      };
    } catch (error) {
      console.error(`❌ Error sending email to ${to}:`, error.message);
      return {
        success: false,
        message: 'Failed to send verification email',
        error: error.message
      };
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(to, orderData, userName) {
    try {
      if (!this.transporter || !this.config) {
        console.warn('⚠️  Email service not initialized');
        return {
          success: false,
          message: 'Email service not configured'
        };
      }

      const emailTemplate = this.getOrderConfirmationEmailTemplate(
        orderData,
        userName
      );

      const mailOptions = {
        from: `"${this.config.SENDER_NAME}" <${this.config.SENDER_EMAIL}>`,
        to: to,
        subject: `📦 Order Confirmation - Order #${orderData.orderNumber}`,
        html: emailTemplate
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Order confirmation email sent to ${to}`);
      
      return {
        success: true,
        message: 'Order confirmation email sent successfully',
        messageId: result.messageId
      };
    } catch (error) {
      console.error(`❌ Error sending order email to ${to}:`, error.message);
      return {
        success: false,
        message: 'Failed to send order confirmation email',
        error: error.message
      };
    }
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusEmail(to, orderData, newStatus, userName) {
    try {
      if (!this.transporter || !this.config) {
        console.warn('⚠️  Email service not initialized');
        return {
          success: false,
          message: 'Email service not configured'
        };
      }

      const emailTemplate = this.getOrderStatusEmailTemplate(
        orderData,
        newStatus,
        userName
      );

      const statusMessages = {
        'processing': 'Your order is being prepared',
        'shipped': 'Your order has been shipped',
        'out_for_delivery': 'Your order is out for delivery',
        'delivered': 'Your order has been delivered',
        'cancelled': 'Your order has been cancelled'
      };

      const mailOptions = {
        from: `"${this.config.SENDER_NAME}" <${this.config.SENDER_EMAIL}>`,
        to: to,
        subject: `📦 Order Status Update - Order #${orderData.orderNumber}`,
        html: emailTemplate
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Order status email sent to ${to}`);
      
      return {
        success: true,
        message: 'Order status email sent successfully',
        messageId: result.messageId
      };
    } catch (error) {
      console.error(`❌ Error sending status email to ${to}:`, error.message);
      return {
        success: false,
        message: 'Failed to send order status email',
        error: error.message
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, resetToken, userName) {
    try {
      if (!this.transporter || !this.config) {
        console.warn('⚠️  Email service not initialized');
        return {
          success: false,
          message: 'Email service not configured'
        };
      }

      // Extract reset code (last 6 digits of token)
      const resetCode = resetToken.substring(resetToken.length - 6);

      const emailTemplate = this.getPasswordResetEmailTemplate(
        resetCode,
        userName
      );

      const mailOptions = {
        from: `"${this.config.SENDER_NAME}" <${this.config.SENDER_EMAIL}>`,
        to: to,
        subject: '🔐 Reset Your Password - VSP Electronics',
        html: emailTemplate
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Password reset email sent to ${to}`);
      
      return {
        success: true,
        message: 'Password reset email sent successfully',
        messageId: result.messageId
      };
    } catch (error) {
      console.error(`❌ Error sending reset email to ${to}:`, error.message);
      return {
        success: false,
        message: 'Failed to send password reset email',
        error: error.message
      };
    }
  }

  /**
   * Send custom HTML email
   */
  async sendCustomEmail(to, subject, htmlContent) {
    try {
      if (!this.transporter || !this.config) {
        console.warn('⚠️  Email service not initialized');
        return {
          success: false,
          message: 'Email service not configured'
        };
      }

      const mailOptions = {
        from: `"${this.config.SENDER_NAME}" <${this.config.SENDER_EMAIL}>`,
        to: to,
        subject: subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent to ${to}`);
      
      return {
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId
      };
    } catch (error) {
      console.error(`❌ Error sending email to ${to}:`, error.message);
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message
      };
    }
  }

  /**
   * Get email subject based on purpose
   */
  getEmailSubject(purpose) {
    const subjects = {
      signup: '🎉 Verify Your Email - VSP Electronics',
      email_change: '✅ Confirm Your New Email - VSP Electronics',
      password_reset: '🔐 Reset Your Password - VSP Electronics'
    };
    return subjects[purpose] || 'Verify Your Email - VSP Electronics';
  }

  /**
   * Get verification email template
   */
  getVerificationEmailTemplate(code, name, purpose) {
    const purposes = {
      signup: {
        title: 'Welcome to VSP Electronics! 🎉',
        description: 'Thank you for signing up. Please verify your email address to complete registration.'
      },
      email_change: {
        title: 'Confirm Your New Email',
        description: 'You recently requested to change your email address. Please verify your new email to continue.'
      }
    };

    const purpose_data = purposes[purpose] || purposes.signup;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; color: #333; margin-bottom: 30px; }
          .code-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 2px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${purpose_data.title}</h2>
          </div>
          
          <p>Hi ${name},</p>
          <p>${purpose_data.description}</p>
          
          <div class="code-box">
            <p style="margin: 0; font-size: 14px; margin-bottom: 10px;">Your Verification Code</p>
            <div class="code">${code}</div>
          </div>
          
          <p>This code will expire in <strong>24 hours</strong>.</p>
          
          <div class="warning">
            <strong>Security Notice:</strong> If you didn't request this verification, please ignore this email. Your account remains secure.
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Need help? Contact our support team at support@vspelectronics.com
          </p>
          
          <div class="footer">
            <p>© 2024 VSP Electronics. All rights reserved.</p>
            <p>This is an automated email, please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get password reset email template
   */
  getPasswordResetEmailTemplate(resetCode, name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; color: #d32f2f; margin-bottom: 30px; }
          .code-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 2px; }
          .warning { background: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0; color: #c62828; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 Password Reset Request</h2>
          </div>
          
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Use the code below to reset your account password.</p>
          
          <div class="code-box">
            <p style="margin: 0; font-size: 14px; margin-bottom: 10px;">Your Reset Code</p>
            <div class="code">${resetCode}</div>
          </div>
          
          <p>This code will expire in <strong>24 hours</strong>.</p>
          
          <div class="warning">
            <strong>⚠️ Security Alert:</strong> If you didn't request this password reset, please ignore this email and your account will remain secure. Your password will NOT change unless you use this code.
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            For security reasons:<br>
            • Never share this code with anyone<br>
            • VSP Electronics staff will never ask for this code<br>
            • Delete this email after resetting your password
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Need help? Contact our support team at support@vspelectronics.com
          </p>
          
          <div class="footer">
            <p>© 2024 VSP Electronics. All rights reserved.</p>
            <p>This is an automated email, please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Log email to console (fallback)
   */
  logEmailToConsole(to, code, name, purpose) {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📧 EMAIL (Test Mode - No SMTP Configured)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`To: ${to}`);
    console.log(`From: ${this.config?.SENDER_EMAIL || 'cogithub42@gmail.com'}`);
    console.log(`Subject: ${this.getEmailSubject(purpose)}`);
    console.log(`\nVerification Code: ${code}`);
    console.log(`Expires: 24 hours from now`);
    console.log(`Purpose: ${purpose}`);
    console.log(`Recipient: ${name}`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }

  /**
   * Get order confirmation email template
   */
  getOrderConfirmationEmailTemplate(orderData, name) {
    const itemsList = orderData.items
      .map(item => `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; color: #2c3e50; margin-bottom: 30px; border-bottom: 3px solid #d32f2f; padding-bottom: 20px; }
          .order-number { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 18px; font-weight: bold; }
          .order-table { width: 100%; margin: 20px 0; }
          .order-table th { background: #d32f2f; color: white; padding: 12px; text-align: left; }
          .summary { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
          .summary-row.total { font-weight: bold; font-size: 18px; border: none; color: #d32f2f; }
          .shipping-info { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          .button { background: #d32f2f; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 Order Confirmation</h2>
            <p>Thank you for your purchase!</p>
          </div>
          
          <p>Hi ${name},</p>
          <p>We're pleased to confirm that your order has been received and will be processed shortly.</p>
          
          <div class="order-number">
            Order ID: <strong>#${orderData.orderNumber}</strong>
          </div>
          
          <h3>Order Items</h3>
          <table class="order-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>₹${(orderData.subtotal || 0).toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>₹${(orderData.shippingCost || 0).toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Tax:</span>
              <span>₹${(orderData.tax || 0).toFixed(2)}</span>
            </div>
            <div class="summary-row total">
              <span>Total Amount:</span>
              <span>₹${orderData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="shipping-info">
            <h4 style="margin-top: 0;">📦 Shipping Address</h4>
            <p>${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName || ''}<br>
            ${orderData.shippingAddress.address}<br>
            ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode || ''}<br>
            ${orderData.shippingAddress.country || 'India'}</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(orderData.estimatedDeliveryDate || Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/order/${orderData.orderId}" class="button">Track Your Order</a>
          </p>
          
          <p>What's next?</p>
          <ul>
            <li>You'll receive a shipping notification when your order is dispatched</li>
            <li>You can track your order status anytime using the button above</li>
            <li>For any queries, contact our support team</li>
          </ul>
          
          <p style="color: #666; font-size: 14px;">
            Need help? Contact us at support@vspelectronics.com or reply to this email.
          </p>
          
          <div class="footer">
            <p>© 2024 VSP Electronics. All rights reserved.</p>
            <p>This is an automated email, please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get order status update email template
   */
  getOrderStatusEmailTemplate(orderData, newStatus, name) {
    const statusIcons = {
      'processing': '⚙️',
      'shipped': '📦',
      'out_for_delivery': '🚚',
      'delivered': '✅',
      'cancelled': '❌'
    };

    const statusMessages = {
      'processing': 'Your order is being prepared and will be shipped soon',
      'shipped': 'Your order is on its way! It will arrive soon',
      'out_for_delivery': 'Your order is out for delivery today',
      'delivered': 'Your order has been delivered successfully',
      'cancelled': 'Your order has been cancelled'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .status-badge { display: inline-block; background: #4caf50; color: white; padding: 15px 30px; border-radius: 25px; font-size: 18px; font-weight: bold; margin: 20px 0; }
          .status-badge.processing { background: #2196f3; }
          .status-badge.shipped { background: #ff9800; }
          .status-badge.out_for_delivery { background: #ff5722; }
          .status-badge.delivered { background: #4caf50; }
          .status-badge.cancelled { background: #f44336; }
          .order-detail { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📦 Order Status Update</h2>
          </div>
          
          <p>Hi ${name},</p>
          <p>Great news! Here's an update on your order:</p>
          
          <div style="text-align: center;">
            <div class="status-badge ${newStatus}">
              ${statusIcons[newStatus] || '📦'} ${newStatus.toUpperCase()}
            </div>
          </div>
          
          <p style="text-align: center; font-size: 16px; color: #555;">
            ${statusMessages[newStatus] || 'Order status updated'}
          </p>
          
          <div class="order-detail">
            <div class="detail-row">
              <span><strong>Order ID:</strong></span>
              <span>#${orderData.orderNumber}</span>
            </div>
            <div class="detail-row">
              <span><strong>Current Status:</strong></span>
              <span>${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('_', ' ')}</span>
            </div>
            ${orderData.trackingNumber ? `<div class="detail-row">
              <span><strong>Tracking Number:</strong></span>
              <span>${orderData.trackingNumber}</span>
            </div>` : ''}
            <div class="detail-row">
              <span><strong>Total Amount:</strong></span>
              <span>₹${orderData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:4200'}/order/${orderData.orderId}" style="background: #d32f2f; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block;">Track Order</a>
          </p>
          
          <p>Need assistance? Contact our support team at support@vspelectronics.com</p>
          
          <div class="footer">
            <p>© 2024 VSP Electronics. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
