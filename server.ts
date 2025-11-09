import express from 'express';
import payload from 'payload';
import path from 'path';

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Payload
const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_KEY_HERE',
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  // Serve static files from React app
  app.use(express.static(path.join(__dirname, 'build')));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Redirect root to admin
  app.get('/', (req, res) => {
    res.redirect('/admin');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Payload CMS Admin: http://localhost:${PORT}/admin`);
  });
};

start();
