import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { customerRouter } from './routes/customer';
import { staffRouter } from './routes/staff';
import { adminRouter } from './routes/admin';
import { compatibilityRouter } from './routes/compatibility';

export const app = express();

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }
      // Allow Cloudflare Pages subdomains and localhost
      if (origin.endsWith('.pages.dev') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, origin);
      }
      return callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);
app.options('*', cors() as any);
app.use(express.json());

// Root Health Check for Render uptime checks
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

// API Routes mounted under /api
app.use('/api', customerRouter);
app.use('/api', staffRouter);
app.use('/api', adminRouter);
app.use('/api', compatibilityRouter);

// Standard Error Handler per API contract: { "error": "..." }
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ error: message });
});
