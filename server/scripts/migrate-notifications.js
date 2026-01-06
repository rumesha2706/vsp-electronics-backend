/**
 * Database Migration Script for Email & WhatsApp Notifications
 * Run this script to set up required database tables
 * 
 * Usage: node server/scripts/migrate-notifications.js
 */

const db = require('../db/index');

async function migrate() {
  try {
    console.log('🔄 Starting notification system migration...\n');

    // Check if inquiries table exists
    const tableCheckResult = await db.query(
      "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'inquiries')"
    );

    if (!tableCheckResult.rows[0].exists) {
      console.log('📝 Creating inquiries table...');
      await db.query(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          subject VARCHAR(500),
          message TEXT NOT NULL,
          source VARCHAR(50) DEFAULT 'web',
          preferred_contact VARCHAR(50) DEFAULT 'email',
          status VARCHAR(50) DEFAULT 'open',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Inquiries table created successfully\n');

      // Create index for faster queries
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_inquiries_status 
        ON inquiries(status)
      `);
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_inquiries_phone 
        ON inquiries(phone)
      `);
      console.log('✅ Inquiries table indexes created\n');
    } else {
      console.log('⏭️  Inquiries table already exists, skipping...\n');
    }

    // Check if inquiry_responses table exists
    const responsesTableCheck = await db.query(
      "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'inquiry_responses')"
    );

    if (!responsesTableCheck.rows[0].exists) {
      console.log('📝 Creating inquiry_responses table...');
      await db.query(`
        CREATE TABLE IF NOT EXISTS inquiry_responses (
          id SERIAL PRIMARY KEY,
          inquiry_id INTEGER NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
          response TEXT NOT NULL,
          responded_by VARCHAR(255),
          responded_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Inquiry responses table created successfully\n');

      // Create index
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_inquiry_responses_inquiry_id 
        ON inquiry_responses(inquiry_id)
      `);
      console.log('✅ Inquiry responses table indexes created\n');
    } else {
      console.log('⏭️  Inquiry responses table already exists, skipping...\n');
    }

    // Check if notification_log table exists (optional, for tracking)
    const notificationTableCheck = await db.query(
      "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_log')"
    );

    if (!notificationTableCheck.rows[0].exists) {
      console.log('📝 Creating notification_log table...');
      await db.query(`
        CREATE TABLE IF NOT EXISTS notification_log (
          id SERIAL PRIMARY KEY,
          recipient VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          channel VARCHAR(50) NOT NULL,
          subject VARCHAR(500),
          message_preview TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          reference_id VARCHAR(255),
          sent_at TIMESTAMP,
          error_message TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Notification log table created successfully\n');

      // Create indexes
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_notification_log_type 
        ON notification_log(type)
      `);
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_notification_log_channel 
        ON notification_log(channel)
      `);
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_notification_log_status 
        ON notification_log(status)
      `);
      console.log('✅ Notification log table indexes created\n');
    } else {
      console.log('⏭️  Notification log table already exists, skipping...\n');
    }

    // Verify email_config table and add default entries if needed
    console.log('📧 Checking email configuration table...');
    const emailConfigCheck = await db.query(
      "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'email_config')"
    );

    if (emailConfigCheck.rows[0].exists) {
      // Check if required email config keys exist
      const requiredKeys = [
        'SENDER_EMAIL',
        'GMAIL_APP_PASSWORD',
        'SENDER_NAME',
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_SECURE'
      ];

      for (const key of requiredKeys) {
        const configCheck = await db.query(
          'SELECT 1 FROM email_config WHERE config_key = $1',
          [key]
        );

        if (configCheck.rows.length === 0) {
          console.log(`  ⚠️  Missing config key: ${key}`);
          console.log(`  💡 Please add it manually to the email_config table`);
        }
      }
      console.log('✅ Email configuration table verified\n');
    } else {
      console.log('⚠️  Email config table not found');
      console.log('   Creating email_config table...\n');
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS email_config (
          id SERIAL PRIMARY KEY,
          config_key VARCHAR(255) UNIQUE NOT NULL,
          config_value TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Insert default entries
      const defaultConfigs = [
        ['SENDER_EMAIL', 'your-email@gmail.com'],
        ['GMAIL_APP_PASSWORD', 'your_16_char_password'],
        ['SENDER_NAME', 'VSP Electronics'],
        ['ADMIN_EMAIL', 'admin@vspelectronics.com'],
        ['SMTP_HOST', 'smtp.gmail.com'],
        ['SMTP_PORT', '587'],
        ['SMTP_SECURE', 'false']
      ];

      for (const [key, value] of defaultConfigs) {
        await db.query(
          `INSERT INTO email_config (config_key, config_value, is_active) 
           VALUES ($1, $2, true)`,
          [key, value]
        );
      }

      console.log('✅ Email config table created with default entries');
      console.log('💡 Please update the values in the database\n');
    }

    // Verify users table has phone column
    console.log('👥 Checking users table phone column...');
    const phoneColumnCheck = await db.query(
      `SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
      )`
    );

    if (!phoneColumnCheck.rows[0].exists) {
      console.log('  Adding phone column to users table...');
      await db.query(`
        ALTER TABLE users ADD COLUMN phone VARCHAR(20)
      `);
      console.log('✅ Phone column added to users table\n');
    } else {
      console.log('✅ Users table already has phone column\n');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Migration completed successfully!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📋 Summary of changes:');
    console.log('  ✓ inquiries table created');
    console.log('  ✓ inquiry_responses table created');
    console.log('  ✓ notification_log table created');
    console.log('  ✓ email_config table verified');
    console.log('  ✓ users.phone column verified\n');

    console.log('⚠️  Next steps:');
    console.log('  1. Update email_config in database with your Gmail credentials');
    console.log('  2. Configure WhatsApp provider (.env file)');
    console.log('  3. Test email sending with a sample order');
    console.log('  4. Configure webhook URL for WhatsApp (if using Meta API)\n');

    console.log('📚 Documentation:');
    console.log('  - NOTIFICATIONS_SETUP.md - Complete setup guide');
    console.log('  - IMPLEMENTATION_GUIDE.md - Quick start guide');
    console.log('  - IMPLEMENTATION_SUMMARY.md - Feature overview\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
