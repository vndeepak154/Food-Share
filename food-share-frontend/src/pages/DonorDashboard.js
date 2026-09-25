import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  PlusCircle, 
  UtensilsCrossed, 
  Clock, 
  MapPin, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Layers,
  CheckCheck,
  Pencil,
  RotateCcw
} from 'lucide-react';
import '../styles/Dashboard.css';

function DonorDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/foods/user/my-listings`);
      setListings(response.data.foods || []);
    } catch (err) {
      setError('Failed to load listings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (foodId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/foods/${foodId}/mark-taken`);
      const updated = response.data.food;
      setListings(listings.map(food => 
        (food.id === foodId || food._id === foodId) ? updated : food
      ));
      setActionSuccess('Food successfully marked as collected/taken!');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError('Failed to update food status');
    }
  };

  // Metrics for Corporate Trust Dashboard Stats
  const totalListings = listings.length;
  const availableCount = listings.filter(f => f.status === 'available').length;
  const reservedCount = listings.filter(f => f.status === 'reserved').length;
  const takenCount = listings.filter(f => f.status === 'taken').length;

  return (
    <div className="dashboard-container">
      {/* Hero Welcome Header */}
      <div className="dashboard-hero-header">
        <div className="hero-text-block">
          <div className="hero-pill-badge">
            <Sparkles size={14} />
            <span>Donor Operations Hub</span>
          </div>
          <h1 className="hero-main-title">
            Manage Surplus <span className="gradient-text">Food Listings</span>
          </h1>
          <p className="hero-subtitle">
            Track real-time distribution, review incoming reservations, and help feed local communities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={fetchListings} 
            className="btn-secondary hero-cta-btn"
            title="Refresh Listings"
          >
            <RotateCcw size={16} />
            <span>Refresh</span>
          </button>
          <Link to="/create-listing" className="btn-primary hero-cta-btn">
            <PlusCircle size={18} />
            <span>Publish New Listing</span>
          </Link>
        </div>
      </div>

      {/* Corporate Trust Metric Stats Bar */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-primary">
            <Layers size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Listings</span>
            <span className="stat-value">{totalListings}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-success">
            <UtensilsCrossed size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Available Now</span>
            <span className="stat-value">{availableCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-warning">
            <Clock size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Pending Pickup</span>
            <span className="stat-value">{reservedCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-secondary">
            <CheckCheck size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Fulfilled Deliveries</span>
            <span className="stat-value">{takenCount}</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="success-message">
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <span>Loading food listings...</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <UtensilsCrossed size={28} />
          </div>
          <h3>No Listings Created Yet</h3>
          <p>
            You haven't listed any surplus food. Publish your first donation now to connect with verified shelters and NGOs.
          </p>
          <Link to="/create-listing" className="btn-primary">
            <PlusCircle size={16} />
            <span>Create First Listing</span>
          </Link>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map(food => {
            const foodId = food.id || food._id;
            const address = food.locationAddress || food.location?.address || food.address || 'Address provided upon request';
            const city = food.locationCity || food.location?.city || food.city || '';
            const expiry = new Date(food.expiryTime).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            });

            return (
              <div key={foodId} className="listing-card">
                {/* Header Banner */}
                <div className="listing-card-header">
                  <div className="listing-title-block">
                    <span className="listing-category-tag">{food.category}</span>
                    <h3 className="listing-name">{food.foodName}</h3>
                  </div>
                  <span className={`status-pill status-${food.status}`}>
                    {food.status}
                  </span>
                </div>

                {/* Details Body */}
                <div className="listing-details">
                  <div className="detail-row">
                    <Package size={16} className="detail-icon" />
                    <span><strong>Quantity:</strong> {food.quantity}</span>
                  </div>

                  <div className="detail-row">
                    <MapPin size={16} className="detail-icon" />
                    <span className="truncate-text"><strong>Pickup:</strong> {address}{city ? `, ${city}` : ''}</span>
                  </div>

                  <div className="detail-row">
                    <Clock size={16} className="detail-icon" />
                    <span><strong>Expires:</strong> {expiry}</span>
                  </div>

                  {food.description && (
                    <p className="listing-desc-snippet">{food.description}</p>
                  )}
                </div>

                {/* Reserved notification strip if reserved */}
                {food.status === 'reserved' && (
                  <div className="reserved-banner">
                    <Clock size={15} />
                    <span>Reserved for pickup</span>
                  </div>
                )}

                {/* Card Actions */}
                <div className="listing-actions">
                  <Link to={`/edit-listing/${foodId}`} className="btn-secondary listing-btn">
                    <Pencil size={14} />
                    <span>Edit</span>
                  </Link>

                  <Link to={`/food/${foodId}`} className="btn-secondary listing-btn">
                    <span>Details</span>
                    <ArrowRight size={14} />
                  </Link>

                  {food.status === 'reserved' && (
                    <button 
                      type="button"
                      className="btn-success listing-btn"
                      onClick={() => markAsTaken(foodId)}
                    >
                      <CheckCircle2 size={15} />
                      <span>Mark Taken</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DonorDashboard;
