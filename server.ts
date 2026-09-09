import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app } from './server/src/app';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

async function startServer() {
  // Vite middleware for development; static dist serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Loka Cafe Unified Server running on http://0.0.0.0:${PORT}`);
    console.log(`Standalone Express service available in server/src/`);

    // Render Free Tier Keep-Alive to prevent 50s cold-start spin-down
    const keepAliveUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
    if (keepAliveUrl) {
      console.log(`[Keep-Alive] Configured for ${keepAliveUrl} (every 12m)`);
      const INTERVAL = 12 * 60 * 1000; // 12 minutes (Render sleeps after 15m)
      setInterval(async () => {
        try {
          const res = await fetch(`${keepAliveUrl.replace(/\/+$/, '')}/health`);
          console.log(`[Keep-Alive] Ping: HTTP ${res.status}`);
        } catch (err: any) {
          console.warn(`[Keep-Alive] Ping notice: ${err.message}`);
        }
      }, INTERVAL);
    }
  });
}

startServer();
