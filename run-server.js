#!/usr/bin/env node
require('dotenv').config();
const app = require('./server-api.js');

const PORT = process.env.PORT || 3000;

console.log('Starting server...');

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Error handlers
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});
