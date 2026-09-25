const { Sequelize } = require('sequelize');
const path = require('path');

// Support loading .env from backend folder or workspace root
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

let sequelize;

const isProduction = process.env.NODE_ENV === 'production';

// Support Railway, Render, and standard cloud MySQL URLs
const connectionUrl = process.env.DATABASE_URL || 
  process.env.MYSQL_URL || 
  process.env.MYSQL_PRIVATE_URL;

// Only enable SSL if explicitly set to true or requested in the connection URL
// (Note: Railway internal MySQL uses private networking without SSL)
const enableSSL = process.env.DB_SSL === 'true' || 
  (connectionUrl && (connectionUrl.includes('ssl=') || connectionUrl.includes('sslmode=')));

const dialectOptions = enableSSL
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  : {};

if (connectionUrl) {
  sequelize = new Sequelize(connectionUrl, {
    dialect: 'mysql',
    logging: isProduction ? false : console.log,
    dialectOptions
  });
} else {
  // Support both custom DB_* and Railway's auto-injected MYSQL* environment variables
  const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'foodshare';
  const dbUser = process.env.DB_USER || process.env.MYSQLUSER || 'root';
  const dbPass = process.env.DB_PASS || process.env.MYSQLPASSWORD || '';
  const dbHost = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
  const dbPort = Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306;

  sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPass,
    {
      host: dbHost,
      port: dbPort,
      dialect: 'mysql',
      logging: isProduction ? false : console.log,
      dialectOptions
    }
  );
}

module.exports = { sequelize };


