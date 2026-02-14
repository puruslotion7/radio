import { minify } from 'html-minifier-terser';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function minifyHTML() {
  const input = readFileSync(__dirname + '/../public/index.html', 'utf8');

  const minified = await minify(input, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  });

  // Create dist/public directory if it doesn't exist
  mkdirSync(__dirname + '/../dist/public', { recursive: true });

  writeFileSync(__dirname + '/../dist/public/index.html', minified);
}

minifyHTML().catch(console.error);
