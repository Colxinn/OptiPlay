#!/usr/bin/env node
/**
 * Custom server for Next.js standalone build on Railway
 * Ensures binding to 0.0.0.0 so Railway's edge router can reach it
 */
const http = require('http');
const url = require('url');

// Load Next.js from the standalone build
const next = require('./node_modules/next');
const { parse } = url;

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0'; // CRITICAL: Must listen on all interfaces for Railway

const app = next({
  dev: false,
  conf: require('./next.config.js')
});

const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error(`Error handling ${req.url}:`, err);
        res.statusCode = 500;
        res.end('Internal server error');
      }
    });

    server.listen(port, hostname, () => {
      console.log(`✓ Ready on http://${hostname}:${port}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Failed to prepare Next.js app:', err);
    process.exit(1);
  });
