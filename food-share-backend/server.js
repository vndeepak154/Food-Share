const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/database');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : '*'; // fallback: allow all (fine for local dev, tighten in production)

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Test Database Connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL connected successfully');
    
    // Sync database models
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log('✅ Database tables synced');
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/foods', require('./routes/foods'));
app.use('/api/users', require('./routes/users'));

// Root endpoint - API Status & Welcome Page
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
      database: 'MySQL connected',
      frontend: 'http://localhost:3000'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
