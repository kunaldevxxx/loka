import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { customerRouter } from './routes/customer';
import { staffRouter } from './routes/staff';
import { adminRouter } from './routes/admin';
import { compatibilityRouter } from './routes/compatibility';

export const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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
