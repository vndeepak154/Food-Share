# 🍱 FoodShare

A web platform connecting food donors (hotels, restaurants, wedding halls, families) with food
recipients (NGOs, orphanages, shelters) to reduce food waste and fight hunger.

## Structure

```
foodshare/
├── food-share-backend/     Node.js + Express + MongoDB API
├── food-share-frontend/    React web app
└── DEPLOYMENT_GUIDE.md     Full setup & deployment instructions
```

## Quick Start

### 1. Backend

```bash
cd food-share-backend
npm install
cp .env.example .env      # then edit MONGODB_URI / JWT_SECRET
npm run dev
```
Runs on http://localhost:5000

### 2. Frontend

```bash
cd food-share-frontend
npm install
cp .env.example .env      # points to your backend URL
npm start
```
Runs on http://localhost:3000

### 3. Try it out

1. Register a **Donor** account (hotel/restaurant) with an address and lat/long.
2. Register a **Recipient** account (NGO/orphanage).
3. As the donor, create a food listing.
4. As the recipient, browse and reserve it.
5. As the donor, mark it as taken once picked up.

See `DEPLOYMENT_GUIDE.md` for full deployment instructions (Heroku, Netlify, DigitalOcean, Docker)
and a production security checklist.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** React, React Router, Axios, Leaflet (maps)

## Core Features (MVP)

- Donor & recipient registration/login
- Create, browse, and search food listings (by city)
- Reserve food & track status (available → reserved → taken)
- Map view of listings
- Editable user profiles

## License

Free to use and modify for your social impact project. 💛
