import 'dotenv/config';
import { app } from './app';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Loka Standalone Backend Service running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});
