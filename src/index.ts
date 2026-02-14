import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import http from 'http';
import compression from 'compression';

const app = express();
const port = Number(process.env.PORT) || 3000;

// Enable gzip compression for all responses
app.use(compression());

// Absolute path to the "public" directory
// Use dist/public if it exists (minified), otherwise use public (dev mode)
const publicDir = path.join(process.cwd(), 'dist', 'public');
const fallbackPublicDir = path.join(process.cwd(), 'public');

// Try to serve from dist/public first (production), fall back to public (dev)
app.use(express.static(publicDir));
app.use(express.static(fallbackPublicDir));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  // Send initial count to new client
  ws.send(JSON.stringify({ count: wss.clients.size }));

  // Broadcast updated count to all clients
  broadcastCount();

  ws.on('close', () => {
    broadcastCount();
  });

  ws.on('error', () => {
    // Silent error handling
  });
});

function broadcastCount() {
  const count = wss.clients.size;
  const message = JSON.stringify({ count });

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      // 1 = OPEN
      client.send(message);
    }
  });
}

server.listen(port, () => {
  console.log(`Static site available at http://localhost:${port}`);
  console.log(`WebSocket server running on ws://localhost:${port}`);
});
