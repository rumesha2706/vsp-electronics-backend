/**
 * Content Model
 * Stores all documentation, guides, and static content in database
 * This replaces markdown files with database records
 */

const db = require('./index');

class ContentModel {
  /**
   * Get content by slug
   * @param {string} slug - Content slug (e.g., 'readme', 'setup-guide')
   * @returns {Promise} Content object
   */
  static async getBySlug(slug) {
    try {
      const query = `
        SELECT id, title, slug, category, content, description, meta_keywords, 
               version, is_published, created_at, updated_at, author
        FROM content
        WHERE slug = $1 AND is_published = true
      `;
      const result = await db.query(query, [slug]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  /**
   * Get all content by category
   * @param {string} category - Content category (e.g., 'guide', 'documentation')
   * @returns {Promise} Array of content
   */
  static async getByCategory(category) {
    try {
      const query = `
        SELECT id, title, slug, category, description, meta_keywords,
               version, created_at, updated_at
        FROM content
        WHERE category = $1 AND is_published = true
        ORDER BY position ASC, created_at DESC
      `;
      const result = await db.query(query, [category]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching content by category:', error);
      throw error;
    }
  }

  /**
   * Get content list with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Paginated content
   */
  static async getList(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const query = `
        SELECT id, title, slug, category, description, meta_keywords,
               version, created_at, updated_at
        FROM content
        WHERE is_published = true
        ORDER BY position ASC, created_at DESC
        LIMIT $1 OFFSET $2
      `;
      const countQuery = `SELECT COUNT(*) FROM content WHERE is_published = true`;

      const [items, count] = await Promise.all([
        db.query(query, [limit, offset]),
        db.query(countQuery)
      ]);

      return {
        items: items.rows,
        total: parseInt(count.rows[0].count),
        page,
        pages: Math.ceil(parseInt(count.rows[0].count) / limit)
      };
    } catch (error) {
      console.error('Error fetching content list:', error);
      throw error;
    }
  }

  /**
   * Create or update content (Admin only)
   * @param {Object} contentData - Content data
   * @returns {Promise} Created/updated content
   */
  static async upsert(contentData) {
    try {
      const {
        title,
        slug,
        category,
        content,
        description,
        metaKeywords,
        version,
        isPublished,
        position,
        author
      } = contentData;

      const query = `
        INSERT INTO content (
          title, slug, category, content, description, meta_keywords,
          version, is_published, position, author, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        ON CONFLICT (slug)
        DO UPDATE SET
          title = $1,
          category = $3,
          content = $4,
          description = $5,
          meta_keywords = $6,
          version = $7,
          is_published = $8,
          position = $9,
          author = $10,
          updated_at = NOW()
        RETURNING *
      `;

      const result = await db.query(query, [
        title,
        slug,
        category,
        content,
        description,
        metaKeywords || null,
        version || '1.0',
        isPublished !== false,
        position || 0,
        author || 'system'
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error upserting content:', error);
      throw error;
    }
  }

  /**
   * Search content
   * @param {string} query - Search term
   * @returns {Promise} Search results
   */
  static async search(searchQuery) {
    try {
      const query = `
        SELECT id, title, slug, category, description, 
               ts_rank(to_tsvector('english', content), query) as rank
        FROM content,
             plainto_tsquery('english', $1) query
        WHERE to_tsvector('english', content) @@ query
          AND is_published = true
        ORDER BY rank DESC
        LIMIT 20
      `;
      const result = await db.query(query, [searchQuery]);
      return result.rows;
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  }

  /**
   * Delete content (Admin only)
   * @param {string} slug - Content slug
   * @returns {Promise} Deletion result
   */
  static async delete(slug) {
    try {
      const query = `DELETE FROM content WHERE slug = $1 RETURNING id`;
      const result = await db.query(query, [slug]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  /**
   * Get content with full text search
   * @param {string} term - Search term
   * @param {string} category - Optional category filter
   * @returns {Promise} Search results
   */
  static async fullTextSearch(term, category = null) {
    try {
      let query = `
        SELECT id, title, slug, category, description,
               ts_rank(to_tsvector('english', title || ' ' || content), 
                      plainto_tsquery('english', $1)) as rank
        FROM content
        WHERE to_tsvector('english', title || ' ' || content) @@ 
              plainto_tsquery('english', $1)
          AND is_published = true
      `;
      const params = [term];

      if (category) {
        query += ` AND category = $2`;
        params.push(category);
      }

      query += ` ORDER BY rank DESC LIMIT 20`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error in full text search:', error);
      throw error;
    }
  }

  /**
   * Get table of contents (for documentation)
   * @param {string} slug - Parent content slug
   * @returns {Promise} TOC with headings
   */
  static async getTableOfContents(slug) {
    try {
      const content = await this.getBySlug(slug);
      if (!content) return null;

      // Extract headings from markdown
      const headings = [];
      const lines = content.content.split('\n');
      
      lines.forEach((line, index) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2];
          const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          
          headings.push({
            level,
            text,
            id,
            lineNumber: index
          });
        }
      });

      return headings;
    } catch (error) {
      console.error('Error generating table of contents:', error);
      throw error;
    }
  }
}

module.exports = ContentModel;
