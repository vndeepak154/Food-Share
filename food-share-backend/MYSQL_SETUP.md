# FoodShare Backend - MySQL Setup Guide

This backend now uses **MySQL** with Sequelize ORM instead of MongoDB.

## Prerequisites

- Node.js v16+ ([download](https://nodejs.org))
- MySQL 5.7+ installed and running

---

## Step 1: Install MySQL

### Windows
1. Download from [mysql.com](https://dev.mysql.com/downloads/mysql)
2. Run installer → follow setup wizard
3. **Important:** Remember your root password!

### Mac
```bash
brew install mysql
brew services start mysql
```

### Linux (Ubuntu)
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo service mysql start
```

---

## Step 2: Create Database User & Database

Open MySQL terminal:

**Windows/Mac/Linux:**
```bash
mysql -u root -p
```
(Enter your root password when prompted)

**Then run these commands:**
```sql
-- Create the database
CREATE DATABASE foodshare;

-- Create a user for the app
CREATE USER 'foodshare'@'localhost' IDENTIFIED BY 'your-strong-password-here';

-- Grant all permissions
GRANT ALL PRIVILEGES ON foodshare.* TO 'foodshare'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

✅ **Done!** Your database is ready.

---

## Step 3: Configure Backend

In the `food-share-backend` folder:

```bash
npm install
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=foodshare
DB_PASS=your-strong-password-here
DB_NAME=foodshare

JWT_SECRET=any-long-random-string-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## Step 4: Sync Database Tables

First time only, sync the database:
```bash
npm run db:sync
```

You should see:
```
✅ MySQL connected successfully
✅ All tables synced successfully
```

---

## Step 5: Run the Backend

```bash
npm run dev
```

You should see:
```
✅ MySQL connected successfully
✅ Database tables synced
🚀 Server running on port 5000
```

**Test it:** Visit `http://localhost:5000/health` → should show `{"status":"Server running"}`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `connect ECONNREFUSED 127.0.0.1:3306` | MySQL is not running. Start it: `brew services start mysql` (Mac) or check Windows services |
| `Access denied for user 'foodshare'@'localhost'` | Wrong password in `.env` — check you set it correctly in MySQL |
| `Unknown database 'foodshare'` | You didn't run the SQL commands above. Create the database first |
| `npm install` fails | Delete `node_modules` and `package-lock.json`, run `npm install` again |

---

## Production Tips

For production (Render/AWS/DigitalOcean):
- Use **MySQL cloud services** (AWS RDS, DigitalOcean Databases, Azure MySQL)
- Never use root user — always create a dedicated app user
- Use strong passwords (20+ chars with symbols)
- Enable SSL/TLS for database connections
- Set `NODE_ENV=production` in `.env`
- Keep sensitive `.env` values in platform environment variables (not in code)

---

## Database Schema

**Users table:**
- id, name, email, password (hashed), phone
- userType (donor/recipient), organizationName
- address, city, latitude, longitude
- description, verified, avatar
- createdAt, updatedAt

**Foods table:**
- id, donorId (foreign key → Users.id), foodName
- category (cooked/raw/packaged/drinks), quantity
- description, preparationTime, expiryTime
- images (JSON array), locationAddress, locationCity
- latitude, longitude, status (available/reserved/taken/expired)
- reservedById, reservedAt, takenAt
- contactPerson, contactPhone, specialRequirements
- createdAt, updatedAt

---

Ready to run? Start with:
```bash
npm run dev
```
