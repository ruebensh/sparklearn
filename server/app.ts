import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Vite dev server
}));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Large limit for offline sync bundles
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100000000 }));
app.use('/api', routes);
app.use(errorHandler);

export default app;
