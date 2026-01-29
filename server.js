#!/usr/bin/env node
/**
 * Wrapper for Next.js standalone server
 * Binds to 0.0.0.0 so Railway's edge router can reach it externally
 */
const http = require('http');

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0'; // CRITICAL: Must listen on all interfaces for Railway

// Load the standalone server handler
const { default: handler } = require('./.next/standalone/server');

// Create HTTP server with the standalone handler
const server = http.createServer(handler);

server.listen(port, hostname, () => {
  console.log(`✓ Ready on http://${hostname}:${port}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
