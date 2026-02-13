import express from 'express';
import path from 'path';
import type { Request, Response } from 'express';

const app = express();
const port = Number(process.env.PORT) || 3000;

// Absolute path to the "public" directory
const publicDir = path.join(process.cwd(), 'public');

// Track active SSE connections
const activeConnections = new Set<Response>();

// SSE endpoint for visitor tracking
app.get('/api/visitors/stream', (req: Request, res: Response) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Add this connection to active set
  activeConnections.add(res);

  // Send initial count
  res.write(`data: ${JSON.stringify({ count: activeConnections.size })}\n\n`);

  // Broadcast updated count to all connections
  broadcastCount();

  // Handle client disconnect
  req.on('close', () => {
    activeConnections.delete(res);
    broadcastCount();
  });
});

function broadcastCount() {
  const count = activeConnections.size;
  const message = `data: ${JSON.stringify({ count })}\n\n`;

  activeConnections.forEach(connection => {
    try {
      connection.write(message);
    } catch {
      activeConnections.delete(connection);
    }
  });
}

// Get visitor count (for non-SSE clients)
app.get('/api/visitors', (_req, res) => {
  res.json({ count: activeConnections.size });
});

// Serve static files (index.html, css, js, images, etc.)
app.use(express.static(publicDir));

// Optional: SPA fallback (uncomment if you have client-side routing)
// app.get("*", (_req, res) => {
//   res.sendFile(path.join(publicDir, "index.html"));
// });

app.listen(port, () => {
  console.log(`Static site available at http://localhost:${port}`);
});
