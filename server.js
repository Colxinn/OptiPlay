#!/usr/bin/env node
const http = require('http');

// Set PORT to listen on all interfaces
const port = parseInt(process.env.PORT || '3000', 10);

// Load the standalone server from the built .next directory
const { default: handler } = require('./.next/standalone/server');

// Create HTTP server that wraps the handler
const server = http.createServer((req, res) => {
  return handler(req, res);
});

// Explicitly bind to 0.0.0.0 (all interfaces)
server.listen(port, '0.0.0.0', () => {
  console.log(`✓ Ready on http://0.0.0.0:${port}`);
});
