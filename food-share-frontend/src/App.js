import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import FoodDetails from './pages/FoodDetails';
import MapView from './pages/MapView';
import Profile from './pages/Profile';

// Components
import Navigation from './components/Navigation';

// CSS
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      
      // Get user profile
      axios.get(`${API_BASE_URL}/users/profile`)
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error('Auth error:', err);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <span>Loading FoodShare...</span>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Atmospheric Corporate Trust background gradient orbs */}
        <div className="bg-ambient-blob bg-blob-1" aria-hidden="true" />
        <div className="bg-ambient-blob bg-blob-2" aria-hidden="true" />

        {isAuthenticated && <Navigation user={user} onLogout={handleLogout} />}
        
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register onRegister={handleLogin} /> : <Navigate to="/dashboard" />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? (
              user?.userType === 'donor' ? <DonorDashboard /> : <RecipientDashboard />
            ) : <Navigate to="/login" />}
          />

          <Route
            path="/create-listing"
            element={isAuthenticated && user?.userType === 'donor' ? <CreateListing /> : <Navigate to="/login" />}
          />

          <Route
            path="/edit-listing/:id"
            element={isAuthenticated && user?.userType === 'donor' ? <EditListing /> : <Navigate to="/login" />}
          />

          <Route
            path="/food/:id"
            element={isAuthenticated ? <FoodDetails user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/map"
            element={isAuthenticated ? <MapView /> : <Navigate to="/login" />}
          />

          <Route
            path="/profile"
            element={isAuthenticated ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />}
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
