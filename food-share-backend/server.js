const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./config/database');

// Support loading .env from backend directory or project root
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();

// CORS Middleware (Optimized for Vercel frontend + Railway backend)
const rawFrontendUrl = process.env.FRONTEND_URL;
const allowedOrigins = rawFrontendUrl
  ? rawFrontendUrl.split(',').map(s => s.trim())
  : '*';

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, Postman, health probes)
    if (!origin) return callback(null, true);

    // If wildcard or not configured, allow all
    if (allowedOrigins === '*' || (Array.isArray(allowedOrigins) && allowedOrigins.includes('*'))) {
      return callback(null, true);
    }

    // Exact domain match
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Auto-allow all Vercel preview and production deployments for your project
    if (origin.endsWith('.vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());


// Check for compiled frontend (for single-service deployment)
const frontendBuildPath = path.join(__dirname, '../food-share-frontend/build');
const hasFrontendBuild = fs.existsSync(frontendBuildPath);

if (hasFrontendBuild) {
  app.use(express.static(frontendBuildPath));
}

// Connect to MySQL with resilient retry logic (prevents container crash loops if MySQL starts slightly after backend)
let isDbConnected = false;

const connectWithRetry = (retries = 10, delayMs = 3000) => {
  sequelize.authenticate()
    .then(() => {
      isDbConnected = true;
      console.log('✅ MySQL connected successfully');
      return sequelize.sync({ alter: false });
    })
    .then(() => {
      console.log('✅ Database tables synced');
    })
    .catch(err => {
      isDbConnected = false;
      console.error(`⚠️ MySQL connection pending (${err.message})`);
      if (retries > 0) {
        console.log(`⏳ Retrying MySQL connection in ${delayMs / 1000}s... (${retries} attempts left)`);
        setTimeout(() => connectWithRetry(retries - 1, delayMs), delayMs);
      } else {
        console.error('❌ Failed to connect to MySQL after maximum retries. Please check your Railway MySQL service.');
      }
    });
};

connectWithRetry();

// Health check (used by cloud platforms like Render, Railway, AWS for health probes)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FoodShare API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/users', require('./routes/users'));

// SPA routing or API Status Welcome Page
if (hasFrontendBuild) {
  // If frontend build exists, send React SPA index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // Root endpoint - API Status & Welcome Page (when running backend standalone)
  app.get('/', (req, res) => {
    if (req.accepts('html')) {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FoodShare API Server</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background: #F8FAFC;
              color: #0F172A;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
            }
            .card {
              background: #FFFFFF;
              border: 1px solid #E2E8F0;
              border-radius: 16px;
              box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
              max-width: 520px;
              width: 100%;
              padding: 36px 32px;
              text-align: center;
            }
            .icon-badge {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #4F46E5, #7C3AED);
              border-radius: 16px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              margin-bottom: 20px;
              box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
            }
            h1 { font-size: 1.6rem; font-weight: 800; margin-bottom: 8px; color: #0F172A; }
            p.subtitle { color: #64748B; font-size: 0.95rem; margin-bottom: 20px; }
            .status-badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 6px 14px;
              background: #ECFDF5;
              color: #059669;
              font-weight: 700;
              font-size: 0.85rem;
              border-radius: 9999px;
              margin-bottom: 24px;
              border: 1px solid #A7F3D0;
            }
            .pulse-dot {
              width: 8px;
              height: 8px;
              background: #10B981;
              border-radius: 50%;
              box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
            }
            .btn-frontend {
              display: block;
              background: linear-gradient(135deg, #4F46E5, #7C3AED);
              color: #FFFFFF;
              text-decoration: none;
              padding: 13px 20px;
              border-radius: 10px;
              font-weight: 700;
              font-size: 0.95rem;
              margin-bottom: 24px;
              box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
              transition: transform 0.15s ease;
            }
            .btn-frontend:hover { transform: translateY(-1px); }
            .endpoints-list {
              text-align: left;
              background: #F1F5F9;
              border-radius: 10px;
              padding: 16px;
              font-size: 0.82rem;
              color: #334155;
              font-family: monospace;
            }
            .endpoints-title {
              font-weight: 700;
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748B;
              margin-bottom: 10px;
              font-family: sans-serif;
            }
            .endpoint-item { margin-bottom: 6px; }
            .endpoint-item:last-child { margin-bottom: 0; }
            .method { font-weight: 700; color: #4F46E5; margin-right: 6px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon-badge">🍱</div>
            <h1>FoodShare API Server</h1>
            <p class="subtitle">Node.js Express + MySQL Backend Service</p>
            <div class="status-badge">
              <span class="pulse-dot"></span>
              <span>Server & MySQL Database Online</span>
            </div>
            <a href="http://localhost:3000" class="btn-frontend">Open Web Application (localhost:3000) &rarr;</a>
            <div class="endpoints-list">
              <div class="endpoints-title">Available API Routes</div>
              <div class="endpoint-item"><span class="method">GET</span>/health &mdash; Health Check</div>
              <div class="endpoint-item"><span class="method">POST</span>/api/auth/register &mdash; User Registration</div>
              <div class="endpoint-item"><span class="method">POST</span>/api/auth/login &mdash; User Login</div>
              <div class="endpoint-item"><span class="method">GET</span>/api/foods &mdash; Active Food Donations</div>
              <div class="endpoint-item"><span class="method">GET</span>/api/users/profile &mdash; User Profile</div>
            </div>
          </div>
        </body>
        </html>
      `);
    } else {
      res.json({
        status: 'Server running',
        service: 'FoodShare API',
        database: 'MySQL connected'
      });
    }
  });
}

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

