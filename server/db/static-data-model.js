/**
 * Static Data Model
 * Stores configuration data, security settings, and category import configurations
 * This replaces hardcoded TypeScript config files
 */

const db = require('./index');

class StaticDataModel {
  /**
   * Get security configuration
   * @returns {Promise} Security config object
   */
  static async getSecurityConfig() {
    try {
      const query = `SELECT * FROM static_configs WHERE config_type = 'security'`;
      const result = await db.query(query);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching security config:', error);
      throw error;
    }
  }

  /**
   * Update security configuration
   * @param {Object} configData - Configuration data
   * @returns {Promise} Updated config
   */
  static async updateSecurityConfig(configData) {
    try {
      const query = `
        INSERT INTO static_configs (config_type, config_key, config_value, updated_at)
        VALUES ('security', $1, $2, NOW())
        ON CONFLICT (config_type, config_key)
        DO UPDATE SET config_value = $2, updated_at = NOW()
        RETURNING *
      `;
      const result = await db.query(query, ['security_settings', JSON.stringify(configData)]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating security config:', error);
      throw error;
    }
  }

  /**
   * Get category import configuration
   * @returns {Promise} Category imports array
   */
  static async getCategoryImports() {
    try {
      const query = `
        SELECT * FROM static_configs 
        WHERE config_type = 'category_import'
        ORDER BY config_key
      `;
      const result = await db.query(query);
      return result.rows.map(row => JSON.parse(row.config_value));
    } catch (error) {
      console.error('Error fetching category imports:', error);
      throw error;
    }
  }

  /**
   * Store category import configuration
   * @param {Array} categories - Categories to import
   * @returns {Promise} Stored configs
   */
  static async storeCategoryImports(categories) {
    try {
      const results = [];
      for (const category of categories) {
        const query = `
          INSERT INTO static_configs (config_type, config_key, config_value, updated_at)
          VALUES ('category_import', $1, $2, NOW())
          ON CONFLICT (config_type, config_key)
          DO UPDATE SET config_value = $2, updated_at = NOW()
          RETURNING *
        `;
        const result = await db.query(query, [
          category.slug,
          JSON.stringify(category)
        ]);
        results.push(result.rows[0]);
      }
      return results;
    } catch (error) {
      console.error('Error storing category imports:', error);
      throw error;
    }
  }

  /**
   * Get OAuth configuration
   * @returns {Promise} OAuth config
   */
  static async getOAuthConfig() {
    try {
      const query = `
        SELECT config_value FROM static_configs 
        WHERE config_type = 'oauth' AND config_key = 'google'
      `;
      const result = await db.query(query);
      return result.rows[0] ? JSON.parse(result.rows[0].config_value) : null;
    } catch (error) {
      console.error('Error fetching OAuth config:', error);
      throw error;
    }
  }

  /**
   * Update OAuth configuration (store securely in DB, not frontend)
   * @param {Object} oauthData - OAuth configuration
   * @returns {Promise} Updated config
   */
  static async updateOAuthConfig(oauthData) {
    try {
      const query = `
        INSERT INTO static_configs (config_type, config_key, config_value, updated_at)
        VALUES ('oauth', 'google', $1, NOW())
        ON CONFLICT (config_type, config_key)
        DO UPDATE SET config_value = $1, updated_at = NOW()
        RETURNING *
      `;
      const result = await db.query(query, [JSON.stringify(oauthData)]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating OAuth config:', error);
      throw error;
    }
  }

  /**
   * Get email configuration
   * @returns {Promise} Email config
   */
  static async getEmailConfig() {
    try {
      const query = `
        SELECT config_value FROM static_configs 
        WHERE config_type = 'email' AND config_key = 'gmail'
      `;
      const result = await db.query(query);
      return result.rows[0] ? JSON.parse(result.rows[0].config_value) : null;
    } catch (error) {
      console.error('Error fetching email config:', error);
      throw error;
    }
  }

  /**
   * Update email configuration (store securely in DB)
   * @param {Object} emailData - Email configuration
   * @returns {Promise} Updated config
   */
  static async updateEmailConfig(emailData) {
    try {
      const query = `
        INSERT INTO static_configs (config_type, config_key, config_value, updated_at)
        VALUES ('email', 'gmail', $1, NOW())
        ON CONFLICT (config_type, config_key)
        DO UPDATE SET config_value = $1, updated_at = NOW()
        RETURNING *
      `;
      const result = await db.query(query, [JSON.stringify(emailData)]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating email config:', error);
      throw error;
    }
  }
}

module.exports = StaticDataModel;
