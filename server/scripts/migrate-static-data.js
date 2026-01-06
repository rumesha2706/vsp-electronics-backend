/**
 * Database Migration for Static Configuration Data
 * Creates tables to store security, OAuth, email, and category configurations
 * Run this migration script to set up the database schema
 * 
 * Usage: node migrate-static-data.js
 */

const db = require('./db/index');

async function createStaticConfigTable() {
  try {
    console.log('Creating static_configs table...');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS static_configs (
        id SERIAL PRIMARY KEY,
        config_type VARCHAR(50) NOT NULL,
        config_key VARCHAR(100) NOT NULL,
        config_value JSONB NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(config_type, config_key)
      );

      CREATE INDEX IF NOT EXISTS idx_static_configs_type_key 
      ON static_configs(config_type, config_key);
    `;

    await db.query(createTableQuery);
    console.log('✓ static_configs table created successfully');

    // Insert default configurations
    console.log('\nInserting default configurations...');

    // Security Configuration
    const securityConfig = {
      recaptcha: {
        siteKey: process.env.RECAPTCHA_SITE_KEY || '',
        secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
        scoreThreshold: 0.5,
        enabledForms: {
          login: true,
          signup: true,
          contactForm: true,
          quote: true,
          checkout: true
        }
      },
      csp: {
        enabled: true,
        policy: {
          'default-src': ["'self'"],
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://accounts.google.com',
            'https://www.google.com/recaptcha/',
            'https://www.gstatic.com/recaptcha/',
            'https://cdnjs.cloudflare.com'
          ],
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://cdnjs.cloudflare.com'
          ],
          'img-src': ["'self'", 'data:', 'https:', 'blob:'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'connect-src': ["'self'", 'https://accounts.google.com'],
          'frame-src': ['https://www.google.com/recaptcha/', 'https://recaptcha.google.com/']
        }
      }
    };

    await db.query(
      `INSERT INTO static_configs (config_type, config_key, config_value, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (config_type, config_key) DO UPDATE SET config_value = $3`,
      ['security', 'security_settings', JSON.stringify(securityConfig), 'Security settings for reCAPTCHA and CSP']
    );
    console.log('✓ Security configuration stored');

    // OAuth Configuration (without secrets - use environment variables for clientId)
    const oauthConfig = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scopes: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    };

    await db.query(
      `INSERT INTO static_configs (config_type, config_key, config_value, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (config_type, config_key) DO UPDATE SET config_value = $3`,
      ['oauth', 'google', JSON.stringify(oauthConfig), 'Google OAuth configuration']
    );
    console.log('✓ OAuth configuration stored');

    // Email Configuration
    const emailConfig = {
      senderEmail: process.env.GMAIL_USER || 'noreply@vspelectronics.com',
      senderName: 'VSP Electronics',
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false
      }
      // NOTE: appPassword is stored separately in environment variables ONLY
    };

    await db.query(
      `INSERT INTO static_configs (config_type, config_key, config_value, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (config_type, config_key) DO UPDATE SET config_value = $3`,
      ['email', 'gmail', JSON.stringify(emailConfig), 'Gmail configuration for email sending']
    );
    console.log('✓ Email configuration stored');

    console.log('\n✅ Database migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update .env file with required credentials:');
    console.log('   - RECAPTCHA_SITE_KEY');
    console.log('   - RECAPTCHA_SECRET_KEY');
    console.log('   - GMAIL_USER');
    console.log('   - GMAIL_APP_PASSWORD');
    console.log('2. Update config API routes in server/routes/index.js');
    console.log('3. Remove hardcoded config files from src/app/config/');
    console.log('4. Update frontend services to fetch configs from API');

    await db.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
createStaticConfigTable();
