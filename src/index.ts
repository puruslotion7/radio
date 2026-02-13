import express from "express";
import path from "path";

const app = express();
const port = Number(process.env.PORT) || 3000;

// Absolute path to the "public" directory
const publicDir = path.join(process.cwd(), "public");

// Serve static files (index.html, css, js, images, etc.)
app.use(express.static(publicDir));

// Optional: SPA fallback (uncomment if you have client-side routing)
// app.get("*", (_req, res) => {
//   res.sendFile(path.join(publicDir, "index.html"));
// });

app.listen(port, () => {
  console.log(`Static site available at http://localhost:${port}`);
});
