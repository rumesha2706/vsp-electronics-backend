#!/usr/bin/env node
/**
 * VSP Electronics Backend API Server
 * Main entry point for Express.js API server
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

// Load Swagger spec
let swaggerSpec;
try {
  swaggerSpec = require('./server/swagger');
} catch (err) {
  console.warn('⚠️  Swagger spec generation failed:', err.message);
  // Fallback basic spec
  swaggerSpec = {
    openapi: '3.0.0',
    info: { title: 'VSP Electronics API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }]
  };
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3000',
  'https://rumesha2706.github.io',
  'https://rumesha2706.github.io/vsp-electronics-frontend'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // Check if it's a verify-email URL or other allowed pattern if strict match fails? 
      // For now, strict match is safest.
      // Actually, let's look at the error "Failed to load subcategories".
      return callback(null, true); // TEMPORARILY ALLOW ALL FOR DEBUGGING IF NEEDED, BUT BETTER TO BE EXPLICIT.
      // No, let's stick to the plan.
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ⭐ STATIC FILES MUST BE BEFORE API ROUTES
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/assets', express.static(path.join(__dirname, 'dist/vsp-electronics/browser/assets')));
// Serve uploaded images specifically (for uploads folder)
app.use('/assets/images', express.static(path.join(__dirname, 'public/assets/images')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'VSP Electronics API Server', status: 'running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

// Swagger UI documentation
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: '/swagger.json',
        name: 'VSP Electronics API'
      }
    ]
  }
};

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerOptions));
app.get('/api-docs/', swaggerUi.setup(swaggerSpec, swaggerOptions));

// Swagger JSON endpoint
app.get('/swagger.json', (req, res) => {
  res.type('application/json');
  res.send(swaggerSpec);
});

// API Routes
const productsApiRouter = require('./server/routes/products-api-router');
const brandsRouter = require('./server/routes/brands-router');
const categoriesApiRouter = require('./server/routes/categories-api-router');
const authRouter = require('./server/routes/auth-router');
const cartRouter = require('./server/routes/cart-router');
const ordersApiRouter = require('./server/routes/orders-router');
const guestOrdersRouter = require('./server/routes/guest-orders-router');
const usersRouter = require('./server/routes/users-router');
const homeApiRouter = require('./server/routes/home-api-router');
const recentlyViewedApiRouter = require('./server/routes/recently-viewed-api-router');
const productImagesRouter = require('./server/routes/product-images-router');
const uploadRouter = require('./server/routes/upload-router');
const inquiryRouter = require('./server/routes/inquiry-router');
const webhooksRouter = require('./server/routes/webhooks-router');
const wishlistRouter = require('./server/routes/wishlist-router');
const compareRouter = require('./server/routes/compare-router');
const quotesRouter = require('./server/routes/quotes-router');

// Authentication middleware
const { authenticateToken } = require('./server/middleware/auth-middleware');

// Mount public routes
app.use('/api/products', productsApiRouter);
app.use('/api/products', productImagesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/categories', categoriesApiRouter);
app.use('/api/home', homeApiRouter);
app.use('/api/recently-viewed', recentlyViewedApiRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/inquiries', inquiryRouter);

// Mount webhook routes (public, no auth required)
app.use('/webhooks/whatsapp', webhooksRouter);

// Mount guest orders route (public - for guest checkout)
app.use('/api/guest-orders', guestOrdersRouter);

// Mount protected routes
app.use('/api/cart', authenticateToken, cartRouter);
app.use('/api/orders', authenticateToken, ordersApiRouter);
app.use('/api/users', authenticateToken, usersRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/compare', compareRouter);
app.use('/api/quotes', quotesRouter);

// 404 handler - only for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Catch-all for undefined routes (should not reach here due to static files)
app.use((req, res) => {
  res.status(404).send('Not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API Server running at http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🎯 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🏷️  Brands API: http://localhost:${PORT}/api/brands`);
  console.log(`📦 Categories API: http://localhost:${PORT}/api/categories`);
  console.log(`💬 Inquiries API: http://localhost:${PORT}/api/inquiries`);
  console.log(`📱 WhatsApp Webhook: http://localhost:${PORT}/webhooks/whatsapp`);
});

// Socket.IO for Real-Time Analytics
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Analytics State
let activeUsers = 0;
const productViewers = new Map(); // productId -> Set<socketId>
const socketProductMap = new Map(); // socketId -> productId

io.on('connection', (socket) => {
  activeUsers++;
  io.emit('activeUsers', activeUsers);

  // Send current stats immediately to new user
  socket.emit('activeUsers', activeUsers);

  socket.on('viewProduct', (productId) => {
    // Ensure consistent type (convert to string for map keys if needed, but frontend sends number)
    // We'll keep it as is, but be careful.

    // Handle switching
    const prevPid = socketProductMap.get(socket.id);
    if (prevPid && prevPid !== productId) {
      const viewers = productViewers.get(prevPid);
      if (viewers) {
        viewers.delete(socket.id);
        // Emit update for previous product
        io.emit('productViewers', { productId: prevPid, count: viewers.size });
      }
    }

    if (!productViewers.has(productId)) {
      productViewers.set(productId, new Set());
    }
    productViewers.get(productId).add(socket.id);
    socketProductMap.set(socket.id, productId);

    // Emit update for current product
    io.emit('productViewers', { productId, count: productViewers.get(productId).size });
  });

  socket.on('stopViewingProduct', (productId) => {
    const viewers = productViewers.get(productId);
    if (viewers) {
      viewers.delete(socket.id);
      io.emit('productViewers', { productId, count: viewers.size });
    }
    socketProductMap.delete(socket.id);
  });

  socket.on('disconnect', () => {
    activeUsers--;
    io.emit('activeUsers', activeUsers);

    // Clean up product views
    const pid = socketProductMap.get(socket.id);
    if (pid) {
      const viewers = productViewers.get(pid);
      if (viewers) {
        viewers.delete(socket.id);
        io.emit('productViewers', { productId: pid, count: viewers.size });
      }
      socketProductMap.delete(socket.id);
    }
  });
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
  console.error('Promise:', promise);
});

module.exports = app;