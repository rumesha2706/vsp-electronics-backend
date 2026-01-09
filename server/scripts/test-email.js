require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Testing email configuration...');
    console.log(`User: ${process.env.GMAIL_USER}`);

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    try {
        // Verify connection configuration
        await transporter.verify();
        console.log('✅ SMTP Connection successful!');

        const mailOptions = {
            from: `VSP Test <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER, // Send to self
            subject: 'VSP Electronics - Test Email',
            text: 'If you receive this, your email configuration is working correctly.',
            html: '<h3>Test Email</h3><p>If you receive this, your email configuration is working correctly.</p>'
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Check your inbox (and spam folder) for the test email.');

    } catch (error) {
        console.error('❌ Error testing email:', error);
        if (error.code === 'EAUTH') {
            console.error('--> Authentication failed. Check your GMAIL_USER and GMAIL_APP_PASSWORD.');
            console.error('--> Ensure you are using an App Password, not your regular password.');
        }
    }
};

testEmail();
