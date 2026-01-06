/**
 * Content API Router
 * Endpoints for retrieving documentation and static content from database
 * Replaces markdown files with database-driven content management
 */

const express = require('express');
const router = express.Router();
const ContentModel = require('../db/content-model');

/**
 * GET /api/content/:slug
 * Get content by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const content = await ContentModel.getBySlug(slug);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * GET /api/content/category/:category
 * Get all content in a category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const content = await ContentModel.getByCategory(category);

    res.json({
      category,
      items: content,
      count: content.length
    });
  } catch (error) {
    console.error('Error fetching content by category:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

/**
 * GET /api/content
 * Get paginated content list
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || null;

    let result;
    if (category) {
      result = await ContentModel.getByCategory(category);
      result = {
        items: result,
        total: result.length,
        page: 1,
        pages: 1
      };
    } else {
      result = await ContentModel.getList(page, limit);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching content list:', error);
    res.status(500).json({ error: 'Failed to fetch content list' });
  }
});

/**
 * GET /api/content/search?q=term
 * Search content
 */
router.get('/search/query', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search term must be at least 2 characters' });
    }

    const results = await ContentModel.fullTextSearch(q);
    res.json({
      query: q,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({ error: 'Failed to search content' });
  }
});

/**
 * GET /api/content/:slug/toc
 * Get table of contents for content
 */
router.get('/:slug/toc', async (req, res) => {
  try {
    const { slug } = req.params;
    const toc = await ContentModel.getTableOfContents(slug);

    if (!toc) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({
      slug,
      headings: toc
    });
  } catch (error) {
    console.error('Error fetching TOC:', error);
    res.status(500).json({ error: 'Failed to fetch table of contents' });
  }
});

/**
 * POST /api/content
 * Create content (Admin only)
 * Body: { title, slug, category, content, description, metaKeywords, version, isPublished }
 */
router.post('/', async (req, res) => {
  try {
    // Validate admin role in middleware
    const { title, slug, category, content } = req.body;

    if (!title || !slug || !category || !content) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await ContentModel.upsert(req.body);
    res.status(201).json({
      message: 'Content created/updated',
      data: result
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

/**
 * PUT /api/content/:slug
 * Update content (Admin only)
 */
router.put('/:slug', async (req, res) => {
  try {
    // Validate admin role in middleware
    const { slug } = req.params;
    const contentData = {
      ...req.body,
      slug
    };

    const result = await ContentModel.upsert(contentData);
    res.json({
      message: 'Content updated',
      data: result
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

/**
 * DELETE /api/content/:slug
 * Delete content (Admin only)
 */
router.delete('/:slug', async (req, res) => {
  try {
    // Validate admin role in middleware
    const { slug } = req.params;
    const result = await ContentModel.delete(slug);

    if (!result) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ message: 'Content deleted' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

/**
 * GET /api/content/categories/list
 * Get all available categories
 */
router.get('/categories/list', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM content
      WHERE is_published = true
      GROUP BY category
      ORDER BY category
    `);

    res.json({
      categories: result.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
