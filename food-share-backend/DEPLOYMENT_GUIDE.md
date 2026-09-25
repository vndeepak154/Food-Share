# FoodShare - Complete Deployment Guide

## 📋 Project Overview

FoodShare is a web platform that connects food donors (hotels, restaurants, families) with food recipients (NGOs, orphanages, shelters). Donors can post available food with location details, and recipients can search and reserve nearby food items.

---

## 🚀 Quick Start (MVP - 2-3 Weeks)

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
- Git
- npm or yarn

---

## **Part 1: Backend Setup**

### Step 1: Initialize Backend

```bash
cd food-share-backend
npm install
```

### Step 2: Create `.env` file

```env
MONGODB_URI=mongodb://localhost:27017/foodshare
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodshare

JWT_SECRET=your-super-secret-key-change-in-production
PORT=5000
NODE_ENV=development
```

### Step 3: Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** (Cloud):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to `.env`

### Step 4: Create Required Folders

```bash
mkdir models routes
```

### Step 5: Run Backend

```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## **Part 2: Frontend Setup**

### Step 1: Create React App

```bash
npx create-react-app food-share-frontend
cd food-share-frontend
```

### Step 2: Install Dependencies

```bash
npm install axios react-router-dom leaflet react-leaflet
```

### Step 3: Create `.env` file

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 4: Copy Component Files

Copy all the React component files into the `src` folder:
- `src/pages/` (all page components)
- `src/components/` (Navigation component)
- `src/styles/` (all CSS files)

### Step 5: Update `src/index.js`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 6: Update `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="FoodShare - Connect Food Donors with Recipients"
    />
    <title>FoodShare - Share Food, Save Lives</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### Step 7: Run Frontend

```bash
npm start
```

App will open on `http://localhost:3000`

---

## **Part 3: Testing the MVP**

### Create Test Accounts

1. **Donor Account** (Hotel/Restaurant):
   - Register at `/register`
   - User Type: Donor
   - Organization: "Test Hotel"
   - Get lat/long from Google Maps (e.g., Bangalore: 12.9716, 77.5946)

2. **Recipient Account** (NGO):
   - Register at `/register`
   - User Type: Recipient
   - Organization: "Test NGO"

### Test Flow

1. Login as Donor
2. Go to "Create Listing"
3. Fill in food details
4. Switch to Recipient account
5. See food on dashboard
6. Click "Reserve Now"
7. Donor sees reservation
8. Donor clicks "Mark as Taken"

---

## **Part 4: Deployment to Production**

### Option A: Deploy to Heroku (Free/Paid)

**Backend:**

1. Install Heroku CLI
2. Create `Procfile` in backend root:
   ```
   web: node server.js
   ```

3. Deploy:
   ```bash
   heroku create foodshare-backend
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_secret
   git push heroku main
   ```

**Frontend:**

1. Update `.env`:
   ```
   REACT_APP_API_URL=https://foodshare-backend.herokuapp.com/api
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy to Netlify:
   - Push to GitHub
   - Connect Netlify to GitHub repo
   - Set build command: `npm run build`
   - Set publish directory: `build`

### Option B: Deploy to AWS/DigitalOcean

**Backend on DigitalOcean (Ubuntu):**

```bash
# SSH into server
ssh root@your_server_ip

# Install Node.js
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb

# Clone repo
git clone your_repo_url
cd food-share-backend
npm install

# Install PM2 (process manager)
sudo npm install -g pm2

# Start app
pm2 start server.js --name "foodshare"
pm2 startup
pm2 save
```

**Frontend on Netlify (Recommended):**

1. Push code to GitHub
2. Connect Netlify
3. Auto-deploys on push

### Option C: Docker (Recommended for Scaling)

**Backend Dockerfile:**

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

**Docker Compose:**

```yaml
version: '3.8'
services:
  backend:
    build: ./food-share-backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongo:27017/foodshare
      JWT_SECRET: your_secret
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  frontend:
    build: ./food-share-frontend
    ports:
      - "3000:3000"

volumes:
  mongo_data:
```

Run with: `docker-compose up`

---

## **Part 5: Add Missing Pages**

You still need to create these files:

### `src/pages/MapView.js`

```javascript
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import '../styles/MapView.css';

function MapView() {
  const [foods, setFoods] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/foods`);
        setFoods(response.data.foods);
      } catch (err) {
        console.error('Error fetching foods:', err);
      }
    };
    fetchFoods();
  }, []);

  return (
    <MapContainer center={[20, 78]} zoom={4} className="map-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {foods.map(food => (
        <Marker
          key={food._id}
          position={[food.location.latitude, food.location.longitude]}
        >
          <Popup>
            <strong>{food.foodName}</strong><br/>
            {food.donor.organizationName}<br/>
            {food.quantity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
```

### `src/pages/FoodDetails.js`

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Details.css';

function FoodDetails({ user }) {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const navigate = useNavigate();

  useEffect(() => {
    fetchFood();
  }, [id]);

  const fetchFood = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/foods/${id}`);
      setFood(response.data);
    } catch (err) {
      console.error('Error fetching food:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!food) return <div>Food not found</div>;

  return (
    <div className="details-container">
      <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
      
      <div className="details-card">
        <h1>{food.foodName}</h1>
        <span className={`status status-${food.status}`}>{food.status}</span>
        
        <div className="details-grid">
          <div>
            <h3>Food Details</h3>
            <p><strong>Category:</strong> {food.category}</p>
            <p><strong>Quantity:</strong> {food.quantity}</p>
            <p><strong>Description:</strong> {food.description}</p>
          </div>

          <div>
            <h3>From Donor</h3>
            <p><strong>Organization:</strong> {food.donor.organizationName}</p>
            <p><strong>Contact:</strong> {food.donor.phone}</p>
            <p><strong>Address:</strong> {food.donor.address}</p>
          </div>

          <div>
            <h3>Location & Time</h3>
            <p><strong>Location:</strong> {food.location.address}</p>
            <p><strong>Expiry:</strong> {new Date(food.expiryTime).toLocaleString()}</p>
            {food.specialRequirements && (
              <p><strong>Special:</strong> {food.specialRequirements}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodDetails;
```

### `src/pages/Profile.js`

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Form.css';

function Profile({ user, setUser }) {
  const [formData, setFormData] = useState(user || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, formData);
      setUser(response.data.user);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>My Profile</h1>
      {message && <div className="success-message">{message}</div>}

      <form onSubmit={handleSubmit} className="food-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={formData.email || ''} disabled />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default Profile;
```

---

## **Part 6: Key Features for MVP**

✅ **Completed:**
- User registration (Donor/Recipient)
- Login with JWT
- Create food listings
- Search foods by city
- Reserve foods
- View reservations
- Mark food as taken

⚠️ **Future Enhancements:**
- Image uploads
- Email notifications
- Admin dashboard for verification
- Ratings/reviews
- Analytics dashboard
- SMS notifications
- Mobile app (React Native)
- Payment integration (for premium features)
- Chat system

---

## **Part 7: Troubleshooting**

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error
```bash
# Check MongoDB is running
mongosh  # or mongo for older versions
```

### CORS Error
- Update backend: Add your frontend URL to CORS
- Backend line: `app.use(cors({ origin: 'http://localhost:3000' }))`

### Token Expiration
- Tokens expire after 30 days
- Users need to login again

---

## **Part 8: Security Checklist**

- [ ] Change JWT_SECRET in production
- [ ] Use MongoDB Atlas (not local)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Setup environment variables properly
- [ ] Add rate limiting to API
- [ ] Validate all user inputs
- [ ] Add CSRF protection
- [ ] Setup error logging (Sentry)
- [ ] Regular database backups
- [ ] Monitor server logs

---

## **Cost Estimate (Monthly)**

| Service | Cost |
|---------|------|
| MongoDB Atlas (free tier) | $0 |
| Heroku backend | $7-50 |
| Netlify frontend | $0 (free) |
| Domain | $1-15 |
| **Total** | **$8-65** |

---

## **Next Steps**

1. ✅ Set up backend
2. ✅ Set up frontend
3. ✅ Test locally
4. ✅ Deploy to cloud
5. ✅ Set up domain
6. ✅ Marketing & user acquisition
7. ✅ Collect feedback
8. ✅ Iterate and improve

---

## **Support & Resources**

- Node.js: https://nodejs.org
- MongoDB: https://docs.mongodb.com
- React: https://react.dev
- Heroku: https://devcenter.heroku.com
- Netlify: https://docs.netlify.com

---

**🚀 Good luck with your FoodShare platform! You're building something meaningful!**
