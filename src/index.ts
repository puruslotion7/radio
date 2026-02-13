import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import http from 'http';

const app = express();
const port = Number(process.env.PORT) || 3000;

// Absolute path to the "public" directory
const publicDir = path.join(process.cwd(), 'public');

// Serve static files (index.html, css, js, images, etc.)
app.use(express.static(publicDir));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  console.log('New visitor connected. Total:', wss.clients.size);

  // Send initial count to new client
  ws.send(JSON.stringify({ count: wss.clients.size }));

  // Broadcast updated count to all clients
  broadcastCount();

  ws.on('close', () => {
    console.log('Visitor disconnected. Total:', wss.clients.size);
    broadcastCount();
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
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
