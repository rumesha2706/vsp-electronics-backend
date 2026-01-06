const nodemailer = require('nodemailer');

// Configure Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Use app-specific password for Gmail
  }
});

/**
 * Send verification email
 */
/**
 * Send verification email
 */
async function sendVerificationEmail(email, firstName, verificationCode) {
  try {
    const mailOptions = {
      from: `VSP Electronics <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address - VSP Electronics',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Email Verification</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px;">Hello ${firstName || 'User'},</p>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for signing up! Please use the following code to verify your email address:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: white; color: #333; padding: 15px 30px; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 5px; display: inline-block; border: 2px dashed #667eea;">
                ${verificationCode}
              </div>
            </div>
            
            <p style="color: #888; font-size: 14px; text-align: center;">
              Enter this code in the verification window on the website.
            </p>
            
            <p style="color: #888; font-size: 12px; margin-top: 30px;">
              This code will expire in 24 hours. If you didn't create this account, please ignore this email.
            </p>
          </div>
          
          <div style="background: #333; color: white; text-align: center; padding: 20px; font-size: 12px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0;">VSP Electronics © 2026 | All rights reserved</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, firstName, resetLink) {
  try {
    const mailOptions = {
      from: `VSP Electronics <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - VSP Electronics',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Password Reset</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px;">Hello ${firstName || 'User'},</p>
            
            <p style="color: #555; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #888; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          
          <div style="background: #333; color: white; text-align: center; padding: 20px; font-size: 12px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0;">VSP Electronics © 2026 | All rights reserved</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(email, firstName, orderDetails) {
  try {
    const mailOptions = {
      from: `VSP Electronics <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation #${orderDetails.orderId} - VSP Electronics`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Order Confirmed!</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px;">Hello ${firstName || 'User'},</p>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for your order! We've received your purchase and will process it shortly.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #38ef7d;">
              <p style="margin: 5px 0; color: #333;"><strong>Order ID:</strong> #${orderDetails.orderId}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p style="color: #888; font-size: 12px;">
              You can track your order in your account dashboard at any time.
            </p>
          </div>
          
          <div style="background: #333; color: white; text-align: center; padding: 20px; font-size: 12px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0;">VSP Electronics © 2026 | All rights reserved</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    return false;
  }
}

/**
 * Send contact us response email
 */
async function sendContactUsResponseEmail(email, name, message) {
  try {
    const mailOptions = {
      from: `VSP Electronics <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'We received your message - VSP Electronics',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Message Received</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px;">Hello ${name},</p>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for contacting us! We've received your message and will get back to you within 24 hours.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 5px 0; color: #333;"><strong>Your message:</strong></p>
              <p style="margin: 10px 0; color: #555; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #888; font-size: 12px;">
              Our team will review your inquiry and respond promptly.
            </p>
          </div>
          
          <div style="background: #333; color: white; text-align: center; padding: 20px; font-size: 12px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0;">VSP Electronics © 2026 | All rights reserved</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Contact response email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending contact response email:', error);
    return false;
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendContactUsResponseEmail
};
