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
  RotateCcw,
  Truck,
  Building2,
  Phone
} from 'lucide-react';
import '../styles/Dashboard.css';

function DonorDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'delivered' | 'all'
  const [actionLoadingId, setActionLoadingId] = useState(null);

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

  const markAsDelivered = async (foodId) => {
    try {
      setActionLoadingId(foodId);
      // Support mark-delivered with fallback to mark-taken
      let response;
      try {
        response = await axios.post(`${API_BASE_URL}/foods/${foodId}/mark-delivered`);
      } catch (err) {
        response = await axios.post(`${API_BASE_URL}/foods/${foodId}/mark-taken`);
      }
      
      const updated = response.data.food;
      setListings(prev => prev.map(food => 
        (food.id === foodId || food._id === foodId) ? updated : food
      ));
      
      setActionSuccess('Food successfully marked as Delivered! It has been moved to the Delivered block.');
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update food status to delivered.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Group listings into Active vs Delivered
  const activeListings = listings.filter(f => f.status === 'available' || f.status === 'reserved');
  const deliveredListings = listings.filter(f => f.status === 'taken' || f.status === 'delivered');

  // Metrics for Corporate Trust Dashboard Stats
  const totalListings = listings.length;
  const availableCount = listings.filter(f => f.status === 'available').length;
  const reservedCount = listings.filter(f => f.status === 'reserved').length;
  const deliveredCount = deliveredListings.length;

  // Render a food card
  const renderListingCard = (food, isDelivered = false) => {
    const foodId = food.id || food._id;
    const address = food.locationAddress || food.location?.address || food.address || 'Address provided upon request';
    const city = food.locationCity || food.location?.city || food.city || '';
    const expiry = new Date(food.expiryTime).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    const deliveredAt = food.takenAt ? new Date(food.takenAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }) : null;
    const recipient = food.reservedBy;

    return (
      <div key={foodId} className={`listing-card ${isDelivered ? 'delivered-card' : (food.status === 'reserved' ? 'reserved-highlight-card' : '')}`}>
        {/* Header Banner */}
        <div className="listing-card-header">
          <div className="listing-title-block">
            <span className="listing-category-tag">{food.category}</span>
            <h3 className="listing-name">{food.foodName}</h3>
          </div>
          <span className={`status-pill ${isDelivered ? 'status-delivered' : `status-${food.status}`}`}>
            {isDelivered ? 'Delivered' : food.status}
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

          {!isDelivered ? (
            <div className="detail-row">
              <Clock size={16} className="detail-icon" />
              <span><strong>Expires:</strong> {expiry}</span>
            </div>
          ) : (
            deliveredAt && (
              <div className="detail-row">
                <CheckCheck size={16} className="detail-icon" style={{ color: '#059669' }} />
                <span><strong>Delivered At:</strong> {deliveredAt}</span>
              </div>
            )
          )}

          {/* Recipient Details if food is reserved or delivered */}
          {recipient && (
            <div className="recipient-info-box">
              <span className="recipient-info-title">
                {isDelivered ? 'Delivered to Recipient:' : 'Reserved by Recipient:'}
              </span>
              <div className="detail-row" style={{ gap: '6px' }}>
                <Building2 size={14} className="detail-icon" />
                <span><strong>{recipient.organizationName || recipient.name}</strong></span>
              </div>
              {recipient.phone && (
                <div className="detail-row" style={{ gap: '6px' }}>
                  <Phone size={14} className="detail-icon" />
                  <span>
                    Phone: <a href={`tel:${recipient.phone}`} className="contact-phone-link">{recipient.phone}</a>
                  </span>
                </div>
              )}
            </div>
          )}

          {food.description && (
            <p className="listing-desc-snippet">{food.description}</p>
          )}
        </div>

        {/* Status Notification Strips */}
        {food.status === 'reserved' && !isDelivered && (
          <div className="reserved-banner">
            <Clock size={15} />
            <span>Reserved for pickup &mdash; ready to hand over</span>
          </div>
        )}

        {isDelivered && (
          <div className="delivered-banner">
            <CheckCircle2 size={15} />
            <span>Successfully Delivered to Recipient</span>
          </div>
        )}

        {/* Card Actions */}
        <div className="listing-actions">
          {!isDelivered ? (
            <>
              <Link to={`/edit-listing/${foodId}`} className="btn-secondary listing-btn">
                <Pencil size={14} />
                <span>Edit</span>
              </Link>

              <Link to={`/food/${foodId}`} className="btn-secondary listing-btn">
                <span>Details</span>
                <ArrowRight size={14} />
              </Link>

              {/* Prominent Mark as Delivered button */}
              <button 
                type="button"
                className="btn-delivered listing-btn"
                onClick={() => markAsDelivered(foodId)}
                disabled={actionLoadingId === foodId}
                title="Mark this food as delivered to the recipient"
              >
                <Truck size={15} />
                <span>{actionLoadingId === foodId ? 'Saving...' : 'Mark as Delivered'}</span>
              </button>
            </>
          ) : (
            <Link to={`/food/${foodId}`} className="btn-secondary listing-btn full-width">
              <span>View Full Details</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    );
  };

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
            Track real-time distribution, fulfill recipient pickups, and manage delivered donations.
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
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('all')}>
          <div className="stat-icon-wrapper stat-icon-primary">
            <Layers size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Listings</span>
            <span className="stat-value">{totalListings}</span>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('active')}>
          <div className="stat-icon-wrapper stat-icon-success">
            <UtensilsCrossed size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Available Now</span>
            <span className="stat-value">{availableCount}</span>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('active')}>
          <div className="stat-icon-wrapper stat-icon-warning">
            <Clock size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Pending Pickup</span>
            <span className="stat-value">{reservedCount}</span>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('delivered')}>
          <div className="stat-icon-wrapper stat-icon-secondary">
            <Truck size={22} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Delivered Block</span>
            <span className="stat-value" style={{ color: '#059669' }}>{deliveredCount}</span>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
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

      {/* Navigation Tabs Bar for Active vs Delivered Blocks */}
      <div className="dashboard-tabs-bar">
        <button 
          type="button"
          className={`tab-btn-corporate ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Package size={17} />
          <span>Active & Pending Donations</span>
          <span className="tab-counter-pill">{activeListings.length}</span>
        </button>

        <button 
          type="button"
          className={`tab-btn-corporate ${activeTab === 'delivered' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivered')}
        >
          <Truck size={17} />
          <span>Delivered Food</span>
          <span 
            className="tab-counter-pill"
            style={{ 
              backgroundColor: activeTab === 'delivered' ? 'rgba(255, 255, 255, 0.25)' : '#ECFDF5', 
              color: activeTab === 'delivered' ? '#FFFFFF' : '#059669' 
            }}
          >
            {deliveredListings.length}
          </span>
        </button>

        <button 
          type="button"
          className={`tab-btn-corporate ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Layers size={17} />
          <span>All Listings</span>
          <span className="tab-counter-pill">{totalListings}</span>
        </button>
      </div>

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
        <>
          {/* TAB 1: ACTIVE & PENDING BLOCK */}
          {(activeTab === 'active' || activeTab === 'all') && (
            <div className="dashboard-section-block">
              {activeTab === 'all' && (
                <div className="section-block-header">
                  <div className="section-block-title-group">
                    <h2 className="section-block-title">
                      <Package size={20} style={{ color: 'var(--primary-color)' }} />
                      <span>Active & Pending Donations</span>
                    </h2>
                    <span className="section-counter-badge">{activeListings.length}</span>
                  </div>
                </div>
              )}

              {activeListings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <CheckCheck size={28} style={{ color: '#059669' }} />
                  </div>
                  <h3>No Active Donations Pending</h3>
                  <p>
                    All your listed donations have been successfully delivered to recipients! Check the <strong>Delivered Food</strong> block to view past donations.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setActiveTab('delivered')}>
                      <Truck size={16} />
                      <span>View Delivered Food ({deliveredCount})</span>
                    </button>
                    <Link to="/create-listing" className="btn-primary">
                      <PlusCircle size={16} />
                      <span>Create New Listing</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="listings-grid">
                  {activeListings.map(food => renderListingCard(food, false))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DELIVERED BLOCK */}
          {(activeTab === 'delivered' || activeTab === 'all') && (
            <div className="dashboard-section-block" style={{ marginTop: activeTab === 'all' ? '40px' : '0' }}>
              {activeTab === 'all' && (
                <div className="section-block-header">
                  <div className="section-block-title-group">
                    <h2 className="section-block-title">
                      <Truck size={20} style={{ color: '#059669' }} />
                      <span>Delivered Food (Fulfilled)</span>
                    </h2>
                    <span className="section-counter-badge success">{deliveredListings.length}</span>
                  </div>
                </div>
              )}

              {deliveredListings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Truck size={28} style={{ color: '#059669' }} />
                  </div>
                  <h3>No Delivered Food Yet</h3>
                  <p>
                    When recipients collect or receive your food donations, click <strong>"Mark as Delivered"</strong> on the listing card to move it into this Delivered block.
                  </p>
                  <button type="button" className="btn-primary" onClick={() => setActiveTab('active')}>
                    <span>Go to Active Listings</span>
                  </button>
                </div>
              ) : (
                <div className="listings-grid">
                  {deliveredListings.map(food => renderListingCard(food, true))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DonorDashboard;
