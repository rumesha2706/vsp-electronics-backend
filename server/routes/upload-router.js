const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const router = express.Router();

// Ensure directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Generate unique filename
function generateFileName(originalName) {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}${ext}`;
}

/**
 * POST /api/upload/image
 * Upload image from Base64 or URL
 * Body: { base64Data?, imageUrl?, type } (type: 'category', 'subcategory', 'brand', 'product')
 */
router.post('/image', async (req, res) => {
  try {
    const { base64Data, imageUrl, type = 'general' } = req.body;

    if (!base64Data && !imageUrl) {
      return res.status(400).json({ error: 'Either base64Data or imageUrl must be provided' });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../public/assets/images', type);
    ensureDirectoryExists(uploadDir);

    let buffer;
    let ext = '.jpg';

    if (base64Data) {
      // Handle Base64 upload
      // Extract extension from data URL if present
      const match = base64Data.match(/data:image\/(\w+);base64,/);
      if (match) {
        ext = `.${match[1]}`;
      }

      // Remove data URL prefix if present
      const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64String, 'base64');
    } else if (imageUrl) {
      // Handle URL download
      try {
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000
        });

        buffer = Buffer.from(response.data, 'binary');

        // Try to determine extension from URL or content-type
        const contentType = response.headers['content-type'];
        if (contentType) {
          const typeMatch = contentType.match(/image\/(\w+)/);
          if (typeMatch) {
            ext = `.${typeMatch[1]}`;
          }
        } else {
          // Try to extract extension from URL
          const urlPath = new URL(imageUrl).pathname;
          const urlExt = path.extname(urlPath);
          if (urlExt) {
            ext = urlExt;
          }
        }
      } catch (error) {
        return res.status(400).json({
          error: 'Failed to download image from URL',
          details: error.message
        });
      }
    }

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: 'No image data received' });
    }

    // Validate image size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.length > maxSize) {
      return res.status(400).json({ error: 'Image size exceeds 10MB limit' });
    }

    // Generate filename and save file
    const fileName = generateFileName(`image${ext}`);
    const filePath = path.join(uploadDir, fileName);

    try {
      ensureDirectoryExists(uploadDir);
      fs.writeFileSync(filePath, buffer);

      // Return full backend URL for frontend use
      const relativePath = `/assets/images/${type}/${fileName}`;
      const protocol = req.protocol;
      const host = req.get('host');
      const backendUrl = `${protocol}://${host}${relativePath}`;

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: backendUrl,
        fileName: fileName
      });
    } catch (saveError) {
      console.warn('⚠️ File system write failed (likely read-only environment). Falling back to Base64.', saveError.message);

      // Fallback: Return Base64 Data URI
      // This allows the database to store the image data directly
      const mimeType = ext === '.svg' ? 'image/svg+xml' : `image/${ext.replace('.', '')}`;
      const base64Fallback = `data:${mimeType};base64,${buffer.toString('base64')}`;

      res.status(201).json({
        success: true,
        message: 'Image processed (DB storage fallback)',
        imageUrl: base64Fallback,
        fileName: fileName // Virtual filename
      });
    }

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      details: error.message
    });
  }
});

/**
 * DELETE /api/upload/image/:type/:fileName
 * Delete an uploaded image
 */
router.delete('/image/:type/:fileName', async (req, res) => {
  try {
    const { type, fileName } = req.params;

    // Validate type
    const validTypes = ['category', 'subcategory', 'brand', 'product', 'general'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid image type' });
    }

    // Prevent path traversal attacks
    if (fileName.includes('..') || fileName.includes('/')) {
      return res.status(400).json({ error: 'Invalid file name' });
    }

    const filePath = path.join(__dirname, '../../public/assets/images', type, fileName);

    // Verify file exists and is in correct directory
    const uploadDir = path.join(__dirname, '../../public/assets/images', type);
    const resolvedPath = path.resolve(filePath);
    const resolvedDir = path.resolve(uploadDir);

    if (!resolvedPath.startsWith(resolvedDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      details: error.message
    });
  }
});

module.exports = router;
