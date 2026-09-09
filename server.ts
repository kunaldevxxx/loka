import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app } from './server/src/app';

const PORT = 3000;

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
  });
}

startServer();
