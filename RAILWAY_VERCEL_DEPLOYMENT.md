# 🚀 Deploying FoodShare on Railway (Backend + MySQL) & Vercel (Frontend)

This guide takes you step-by-step through deploying FoodShare with:
- **Backend & MySQL Database** on **[Railway](https://railway.app)**
- **Frontend React Application** on **[Vercel](https://vercel.com)**

Both platforms provide generous free tiers and seamless GitHub auto-deployments.

---

## 📋 Overview of Deployment Flow

```
+------------------------------------------------------------------------+
|                               GITHUB REPO                              |
+-------------------+--------------------------------+-------------------+
                    |                                |
                    v                                v
+------------------------------------+  +--------------------------------+
|         RAILWAY PLATFORM           |  |        VERCEL PLATFORM         |
|                                    |  |                                |
|  1. Provision MySQL Database       |  |  Deploys React Frontend        |
|  2. Deploy Node.js Express API     |  |  from /food-share-frontend     |
|     (/food-share-backend)          |  |                                |
|  3. Exposes https://api-url...     |  |  REACT_APP_API_URL             |
|                                    |  |  Points to Railway API         |
+------------------------------------+  +--------------------------------+
```

---

## 🗄️ Part 1: Deploy Backend & MySQL on Railway

### Step 1: Create a Railway Account & New Project
1. Go to **[railway.app](https://railway.app)** and log in with your **GitHub** account.
2. Click **"+ New Project"**.
3. Choose **"Provision MySQL"**.
   - Railway will provision a fully managed MySQL 8 database within seconds.

---

### Step 2: Add your Backend Service to the Project
1. Inside the same Railway project canvas, click **"+ New"** &rarr; **"GitHub Repo"**.
2. Select your `foodshare` repository.
3. Click on the newly created service card &rarr; go to the **Settings** tab:
   - **Service Name:** Rename to `foodshare-backend` (optional, for clarity).
   - **Root Directory:** Click **Edit** &rarr; set to `/food-share-backend` &rarr; click **Save**.
   - *(Note: Railway will detect `railway.json` and `Procfile` automatically).*

---

### Step 3: Link MySQL & Set Environment Variables
1. Click on your `foodshare-backend` service &rarr; go to the **Variables** tab.
2. Click **"New Variable"** or **"Add Reference"**:
   - Click **Add Reference** &rarr; select `MySQL` &rarr; choose `MYSQL_URL` (or type `${{MySQL.MYSQL_URL}}`).
   - Add `JWT_SECRET`: type any random 32+ character string (e.g. `k8s9d7f6g5h4j3k2l1m0z9x8c7v6b5n4`).
   - Add `NODE_ENV`: `production`
   - Add `PORT`: `5000` (Railway will assign its own port, but this is a safe default).
   
   *(Note: The code automatically recognizes Railway's `MYSQL_URL`, `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, and `MYSQLDATABASE` variables).*

---

### Step 4: Generate a Public Domain for the Backend
1. In `foodshare-backend` service, go to the **Settings** tab.
2. Scroll to the **Networking** section.
3. Click **"Generate Domain"** (e.g., `foodshare-backend-production-xxxx.up.railway.app`).
4. **Copy this domain URL** &mdash; you will need it for Vercel in Part 2!

---

### Step 5: Test the Backend
Open a new browser tab and visit:
```text
https://<your-railway-domain>/health
```
You should see:
```json
{
  "status": "ok",
  "service": "FoodShare API",
  "uptime": 12,
  "timestamp": "2026-09-25T..."
}
```
✅ **Backend and MySQL are live and running!**

---

## ⚡ Part 2: Deploy Frontend on Vercel

### Step 1: Import Project to Vercel
1. Go to **[vercel.com](https://vercel.com)** and log in with your **GitHub** account.
2. Click **"Add New..."** &rarr; **"Project"**.
3. Locate your `foodshare` repository and click **"Import"**.

---

### Step 2: Configure Project Settings
In the configuration screen before clicking Deploy:
1. **Framework Preset:** Select **"Create React App"** (usually detected automatically).
2. **Root Directory:**
   - Click **Edit** next to Root Directory.
   - Select `food-share-frontend`.
   - Click **Continue**.

---

### Step 3: Add Environment Variables
Expand the **Environment Variables** section and add:

| Key | Value | Notes |
|---|---|---|
| `REACT_APP_API_URL` | `https://<your-railway-domain>/api` | **Must include `/api` at the end!** |
| `CI` | `false` | Prevents warning halts during build |

*(Example: `https://foodshare-backend-production-xxxx.up.railway.app/api`)*

---

### Step 4: Click Deploy
1. Click **"Deploy"**.
2. Vercel will install dependencies and build your React application in ~1 minute.
3. Once completed, you will see a preview screen with your production URL (e.g., `https://foodshare-frontend.vercel.app`).
4. Click on the domain to open your live application!

---

## 🔄 Part 3: Connect Frontend Domain to Backend CORS (Final Polish)

1. Copy your live Vercel domain (e.g., `https://foodshare-frontend.vercel.app`).
2. Go back to **Railway** &rarr; click `foodshare-backend` &rarr; **Variables** tab.
3. Add or update:
   - `FRONTEND_URL` = `https://foodshare-frontend.vercel.app`
4. Railway will automatically redeploy the backend with the new configuration.

*(Note: The backend has built-in wildcard support for all `*.vercel.app` preview domains, so future preview deployments will work automatically).*

---

## ✅ Part 4: Verify Full Functionality

1. Open your **Vercel frontend URL**.
2. Click **Register** &rarr; Create a **Donor** account (e.g., Hotel/Restaurant).
3. Post a new food listing with pickup details.
4. Open an incognito window &rarr; Register a **Recipient** account (e.g., NGO/Shelter).
5. View the dashboard, check the map view, and reserve the food listing.
6. Switch back to the Donor window &rarr; confirm reservation status.

---

## 🛠️ Common Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| **CORS error in browser console** | Backend hasn't allowed Vercel domain | Add `FRONTEND_URL=https://<your-app>.vercel.app` in Railway variables. |
| **Network Error / Failed to fetch** | Missing `/api` on the backend URL | Ensure `REACT_APP_API_URL` in Vercel ends with `/api` (e.g. `https://xxx.up.railway.app/api`). |
| **Database connection error in Railway logs** | MySQL reference variable missing | In Railway backend service &rarr; Variables &rarr; click **Add Reference** &rarr; select `${{MySQL.MYSQL_URL}}`. |
| **404 when refreshing page on Vercel** | SPA client-side routing | Already resolved by [`vercel.json`](file:///c:/Users/deepak/Downloads/foodshare-mysql-version/food-share-frontend/vercel.json) rewrites. |
| **Build failed: treated warnings as errors** | ESLint CI check | Already resolved by `CI=false` in [`.env.production`](file:///c:/Users/deepak/Downloads/foodshare-mysql-version/food-share-frontend/.env.production). |
