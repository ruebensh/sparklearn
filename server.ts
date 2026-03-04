import 'dotenv/config';

import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './server/app.js';
import connectDB from './server/config/db.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`🚀 Crisis Classroom API running on port ${PORT}`);
  });
}

startServer();