import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? Number(process.env.PORT) : 5174;
const FLYIMG = (process.env.FLYIMG_URL || 'http://localhost:8088').replace(/\/$/, '');

const app = express();

// Serve static example files
app.use(express.static(path.join(__dirname)));

// Proxy /upload (and any subpath) to the Flyimg instance
// Use a regex compatible with path-to-regexp v6 (Express 5)
app.all(/^\/upload(?:\/.*)?$/, async (req, res) => {
  try {
    const subpath = req.originalUrl.slice('/upload'.length);
    const targetUrl = FLYIMG + '/upload' + subpath;

    // Reconstruct request to upstream
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (!v) continue;
      if (k.toLowerCase() === 'host') continue;
      if (k.toLowerCase() === 'content-length') continue;
      headers.set(k, Array.isArray(v) ? v.join(', ') : String(v));
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
      // Node fetch requires duplex when sending a streamed body
      duplex: req.method === 'GET' || req.method === 'HEAD' ? undefined : 'half',
      redirect: 'manual',
    });

    // Mirror upstream status and headers
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      // Avoid duplicate/invalid headers
      if (key.toLowerCase() === 'content-encoding') return;
      res.setHeader(key, value);
    });

    // Stream body
    if (upstream.body) {
      try {
        for await (const chunk of upstream.body) {
          res.write(chunk);
        }
      } catch (_) {
        // ignore streaming errors, end response
      }
    }
    res.end();
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', detail: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`[example] serving on http://localhost:${PORT}`);
  console.log(`[example] proxying /upload → ${FLYIMG}/upload`);
});


