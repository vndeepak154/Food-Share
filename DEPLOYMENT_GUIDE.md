# 🍱 FoodShare - Production Deployment Guide (MySQL Edition)

This guide covers everything you need to deploy FoodShare to the cloud using modern, free-tier-friendly platforms.

---

## 🏗️ Architecture Overview

- **Backend:** Node.js + Express with Sequelize ORM + MySQL 8.0
- **Frontend:** React (SPA) with Leaflet Maps, React Router v6, Axios
- **Database:** Managed Cloud MySQL (TiDB Cloud, Aiven, Railway, or AWS RDS)

---

## 🗄️ Step 1: Set Up a Free Cloud MySQL Database

Before deploying the app, you need a MySQL database accessible from the internet. Here are the best free cloud options:

### Option A: TiDB Cloud (Recommended - Free Tier, No Credit Card)
1. Go to **[tidbcloud.com](https://tidbcloud.com)** and sign up.
2. Click **Create Cluster** &rarr; Select **Serverless** (Free 5GB).
3. Under **Security Settings**, create a root password and click **Connect**.
4. Choose **Connection Method**: Standard / Node.js.
5. Copy the connection parameters (`host`, `port`, `user`, `password`, `database`) or connection string (`mysql://...`).
6. *Note: TiDB Cloud requires SSL (`DB_SSL=true`).*

### Option B: Aiven MySQL (Free Trial)
1. Go to **[aiven.io](https://aiven.io)** &rarr; Create a **MySQL** service.
2. Note your `Service URI` or individual connection details (`Host`, `Port`, `User`, `Password`).

### Option C: Railway MySQL
1. Go to **[railway.app](https://railway.app)** &rarr; Create new project &rarr; **Provision MySQL**.
2. Go to the **Variables** tab &rarr; Copy `DATABASE_URL` (or `MYSQL_URL`).

---

## 🚀 Deployment Options

Choose the deployment method that fits your needs:

---

### 🌟 Option 1: Unified Fullstack on Render (Easiest - 1 URL, Free Tier)

Both frontend and backend run as a single web service. Express serves the React production build and the `/api` endpoints under the same domain. **No CORS issues!**

1. Push your repository to **GitHub**.
2. Go to **[render.com](https://render.com)** and log in.
3. Click **New +** &rarr; **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:
   - **Name:** `foodshare`
   - **Region:** Closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank / default)*
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. Add **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode & static serving |
   | `JWT_SECRET` | `generate-a-long-random-string` | Secret for auth tokens |
   | `DATABASE_URL` | `mysql://user:pass@host:port/foodshare` | Your cloud MySQL URL |
   | `DB_SSL` | `true` | Required for TiDB / Aiven / cloud MySQL |
7. Click **Create Web Service**.
8. Once built, open your Render URL (e.g. `https://foodshare.onrender.com`). You will see the full working React application!

---

### 🌐 Option 2: Split Deployment (Backend on Render + Frontend on Vercel/Netlify)

#### A. Deploy Backend to Render:
1. Go to **Render** &rarr; **New +** &rarr; **Web Service**.
2. Connect your repo.
3. Settings:
   - **Root Directory:** `food-share-backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Environment Variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secure-random-secret`
   - `DATABASE_URL=your-cloud-mysql-url` (or `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`)
   - `DB_SSL=true`
   - `FRONTEND_URL=https://your-frontend-site.vercel.app` (update after frontend deploy)
5. Copy your backend URL (e.g., `https://foodshare-api.onrender.com`).

#### B. Deploy Frontend to Vercel:
1. Go to **[vercel.com](https://vercel.com)** &rarr; **Add New...** &rarr; **Project**.
2. Import your GitHub repo.
3. In project settings:
   - **Root Directory:** Click edit &rarr; select `food-share-frontend`.
   - **Framework Preset:** `Create React App`
4. Expand **Environment Variables**:
   - `REACT_APP_API_URL` = `https://foodshare-api.onrender.com/api` (your backend URL + `/api`)
   - `CI` = `false`
5. Click **Deploy**.
6. Copy your frontend Vercel URL and add it to `FRONTEND_URL` in the Render backend environment variables.

#### Alternative: Deploy Frontend to Netlify:
1. Go to **[netlify.com](https://netlify.com)** &rarr; **Add new site** &rarr; **Import from GitHub**.
2. Set:
   - **Base directory:** `food-share-frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
3. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://foodshare-api.onrender.com/api`
   - `CI` = `false`
4. Click **Deploy**. *(The included `public/_redirects` file automatically handles React Router navigation).*

---

### 🐳 Option 3: Docker & Docker Compose (Self-Hosted VPS / AWS EC2 / DigitalOcean)

If you have a Linux VPS (Ubuntu/Debian) or want to run everything with Docker:

1. Clone your repo onto the server:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. Start the database, backend, and frontend containers:
   ```bash
   docker-compose up -d --build
   ```

3. Check container status:
   ```bash
   docker-compose ps
   ```

4. The app is accessible at:
   - **Frontend:** `http://<your-server-ip>:3000`
   - **Backend API:** `http://<your-server-ip>:5000/api`
   - **Health Check:** `http://<your-server-ip>:5000/health`

---

## 🔒 Production Security Checklist

- [x] **Git Protection:** Root `.gitignore` prevents pushing `.env` files or `node_modules`
- [ ] **Strong JWT Secret:** Use at least a 32-character random string for `JWT_SECRET`
- [ ] **SSL / TLS:** Ensure `DB_SSL=true` is enabled for cloud database connections
- [ ] **CORS Restrictions:** Restrict `FRONTEND_URL` on the backend to your actual frontend domain
- [ ] **HTTPS:** Render, Vercel, and Netlify provide free automatic SSL certificates

---

## 🛠️ Verification & Testing

Once deployed:
1. **Health Check:** Visit `https://<backend-url>/health` &rarr; should return `{"status":"ok"}`.
2. **Registration:** Register a new test Donor and test Recipient.
3. **Listings:** Create a food listing and verify it appears on the dashboard and map.
4. **Reservation:** Log in as Recipient, reserve the listing, and confirm the status changes to `reserved`.
