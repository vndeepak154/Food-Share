# 🍱 FoodShare

A web platform connecting food donors (hotels, restaurants, wedding halls, families) with food
recipients (NGOs, orphanages, shelters) to reduce food waste and fight hunger.

## Structure

```
foodshare/
├── food-share-backend/     Node.js + Express + MySQL (Sequelize ORM)
├── food-share-frontend/    React web app
├── MYSQL_SETUP.md          MySQL installation & config guide
└── DEPLOYMENT_GUIDE.md     Full deployment instructions
```

## Quick Start (5 minutes)

### 1. Set Up MySQL Database

```bash
# Install MySQL (Mac: brew install mysql, Linux: sudo apt-get install mysql-server, Windows: download from mysql.com)
# Start MySQL service

# Then create database:
mysql -u root -p
# Enter password, then:
CREATE DATABASE foodshare;
CREATE USER 'foodshare'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON foodshare.* TO 'foodshare'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Run Backend

```bash
cd food-share-backend
npm install
cp .env.example .env
# Edit .env: set DB_USER=foodshare, DB_PASS=your-password

npm run db:sync      # First time: creates tables
npm run dev          # Runs on http://localhost:5000
```

### 3. Run Frontend

```bash
cd food-share-frontend
npm install
cp .env.example .env
# Confirm REACT_APP_API_URL=http://localhost:5000/api

npm start            # Runs on http://localhost:3000
```

### 4. Test It

1. Register **Donor** (hotel/restaurant)
2. Register **Recipient** (NGO/shelter)
3. Create listing as donor → reserve as recipient
4. Mark taken as donor

✅ **Done!**

## Detailed Guides

- **Deploy on Railway & Vercel:** See [RAILWAY_VERCEL_DEPLOYMENT.md](RAILWAY_VERCEL_DEPLOYMENT.md)
- **All Deployment Options (Render, Docker, Netlify):** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Local MySQL Setup:** See [food-share-backend/MYSQL_SETUP.md](food-share-backend/MYSQL_SETUP.md)

## Tech Stack

- **Backend:** Node.js, Express, **MySQL + Sequelize**, JWT, bcrypt
- **Frontend:** React, React Router, Axios, Leaflet

## Core Features

✅ Auth: registration/login with JWT
✅ Food listings: create, search, filter by city & distance
✅ Reservations: available → reserved → taken
✅ Map view of nearby food
✅ User profiles (editable)

## License

Free to use and modify. 💛
