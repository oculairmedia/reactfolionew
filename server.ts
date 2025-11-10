import express from 'express';
import payload from 'payload';
import path from 'path';

require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['PAYLOAD_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  console.error('See .env.example for reference.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Payload
const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  // Serve static files from React app
  app.use(express.static(path.join(__dirname, 'build')));

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        payload: 'initialized',
        uptime: process.uptime(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Redirect root to admin
  app.get('/', (req, res) => {
    res.redirect('/admin');
  });

  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`✅ Payload CMS Admin: http://localhost:${PORT}/admin`);
    console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
  });
};

start().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
