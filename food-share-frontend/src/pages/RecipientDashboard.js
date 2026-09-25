import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  MapPin, 
  Clock, 
  Package, 
  Building2, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Map,
  Sparkles,
  UtensilsCrossed,
  BookmarkCheck,
  Filter,
  RotateCcw
} from 'lucide-react';
import '../styles/Dashboard.css';

function RecipientDashboard() {
  const [foods, setFoods] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [searchCity, setSearchCity] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (activeTab === 'available') {
      fetchAvailableFoods();
    } else {
      fetchReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchCity]);

  const fetchAvailableFoods = async () => {
    try {
      setLoading(true);
      const params = searchCity ? { city: searchCity } : {};
      const response = await axios.get(`${API_BASE_URL}/foods`, { params });
      setFoods(response.data.foods || []);
    } catch (err) {
      setError('Failed to load food listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/foods/user/my-reservations`);
      setReservations(response.data.foods || []);
    } catch (err) {
      setError('Failed to load reservations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reserveFood = async (foodId) => {
    try {
      await axios.post(`${API_BASE_URL}/foods/${foodId}/reserve`);
      setFoods(foods.filter(f => (f.id !== foodId && f._id !== foodId)));
      setActionSuccess('Food reserved successfully! Check "My Reservations" for pickup details.');
      setTimeout(() => setActionSuccess(''), 5000);
      fetchReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve food. It may have already been reserved.');
    }
  };

  // Filter foods by category if selected
  const filteredFoods = categoryFilter === 'all' 
    ? foods 
    : foods.filter(f => f.category?.toLowerCase() === categoryFilter);

  return (
    <div className="dashboard-container">
      {/* Hero Welcome Header */}
      <div className="dashboard-hero-header">
        <div className="hero-text-block">
          <div className="hero-pill-badge">
            <Sparkles size={14} />
            <span>Community Relief Portal</span>
          </div>
          <h1 className="hero-main-title">
            Discover Fresh <span className="gradient-text">Food Supplies</span>
          </h1>
          <p className="hero-subtitle">
            Browse available surplus food donations from verified partners or review your scheduled pickups.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => {
              if (activeTab === 'available') fetchAvailableFoods();
              else fetchReservations();
            }} 
            className="btn-secondary hero-cta-btn"
            title="Refresh Listings"
          >
            <RotateCcw size={16} />
            <span>Refresh</span>
          </button>
          <Link to="/map" className="btn-secondary hero-cta-btn">
            <Map size={18} />
            <span>Interactive Map</span>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="dashboard-tabs-bar">
        <button 
          type="button"
          className={`tab-btn-corporate ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          <UtensilsCrossed size={17} />
          <span>Available Food Donations</span>
          <span className="tab-counter-pill">{foods.length}</span>
        </button>

        <button 
          type="button"
          className={`tab-btn-corporate ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          <BookmarkCheck size={17} />
          <span>My Reservations</span>
          <span className="tab-counter-pill">{reservations.length}</span>
        </button>
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

      {activeTab === 'available' ? (
        <>
          {/* Search & Category Filter Bar */}
          <div className="filter-controls-card">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Filter by city name (e.g., Delhi, Mumbai, New York)..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
              {searchCity && (
                <button 
                  type="button" 
                  className="clear-search-btn"
                  onClick={() => setSearchCity('')}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="category-filter-chips">
              <span className="filter-label"><Filter size={14} /> Category:</span>
              {['all', 'cooked', 'packaged', 'raw', 'drinks'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`chip-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <span>Fetching available food donations...</span>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <UtensilsCrossed size={28} />
              </div>
              <h3>No Donations Available</h3>
              <p>
                {searchCity 
                  ? `No listings currently match "${searchCity}". Try clearing the search filter or view the map.` 
                  : 'There are no unclaimed donations right now. Check back soon or view the map for regional listings.'}
              </p>
              {searchCity && (
                <button 
                  type="button"
                  className="btn-secondary" 
                  onClick={() => setSearchCity('')}
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="listings-grid">
              {filteredFoods.map(food => {
                const foodId = food.id || food._id;
                const address = food.locationAddress || food.location?.address || food.address || 'Address provided on reservation';
                const city = food.locationCity || food.location?.city || food.city || '';
                const donorName = food.donor?.organizationName || food.donor?.name || 'Verified Donor';
                const expiry = new Date(food.expiryTime).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                });

                return (
                  <div key={foodId} className="listing-card">
                    <div className="listing-card-header">
                      <div className="listing-title-block">
                        <span className="listing-category-tag">{food.category}</span>
                        <h3 className="listing-name">{food.foodName}</h3>
                      </div>
                      <span className="status-pill status-available">
                        Available
                      </span>
                    </div>

                    <div className="listing-details">
                      <div className="detail-row">
                        <Building2 size={16} className="detail-icon" />
                        <span><strong>From:</strong> {donorName}</span>
                      </div>

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
                        <span><strong>Pick up by:</strong> {expiry}</span>
                      </div>

                      {food.description && (
                        <p className="listing-desc-snippet">{food.description}</p>
                      )}
                    </div>

                    <div className="listing-actions">
                      <Link to={`/food/${foodId}`} className="btn-secondary listing-btn">
                        <span>Details</span>
                        <ArrowRight size={14} />
                      </Link>

                      <button 
                        type="button"
                        className="btn-primary listing-btn"
                        onClick={() => reserveFood(foodId)}
                      >
                        <BookmarkCheck size={16} />
                        <span>Reserve Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* My Reservations Tab */
        <>
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <span>Loading your active reservations...</span>
            </div>
          ) : reservations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <BookmarkCheck size={28} />
              </div>
              <h3>No Active Reservations</h3>
              <p>You have not reserved any food items yet. Switch to "Available Food Donations" to claim supplies.</p>
              <button 
                type="button"
                className="btn-primary" 
                onClick={() => setActiveTab('available')}
              >
                Browse Available Food
              </button>
            </div>
          ) : (
            <div className="listings-grid">
              {reservations.map(food => {
                const foodId = food.id || food._id;
                const address = food.locationAddress || food.location?.address || food.address || 'Address provided';
                const city = food.locationCity || food.location?.city || food.city || '';
                const donorName = food.donor?.organizationName || food.donor?.name || 'Partner Donor';
                const donorPhone = food.contactPhone || food.donor?.phone;
                const expiry = new Date(food.expiryTime).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                });
                const reservedAt = food.reservedAt ? new Date(food.reservedAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                }) : 'Recently';

                return (
                  <div key={foodId} className="listing-card reserved-highlight-card">
                    <div className="listing-card-header">
                      <div className="listing-title-block">
                        <span className="listing-category-tag">{food.category}</span>
                        <h3 className="listing-name">{food.foodName}</h3>
                      </div>
                      <span className={`status-pill status-${food.status}`}>
                        {food.status}
                      </span>
                    </div>

                    <div className="listing-details">
                      <div className="detail-row">
                        <Building2 size={16} className="detail-icon" />
                        <span><strong>Donor:</strong> {donorName}</span>
                      </div>

                      {donorPhone && (
                        <div className="detail-row">
                          <Phone size={16} className="detail-icon" />
                          <span>
                            <strong>Phone:</strong>{' '}
                            <a href={`tel:${donorPhone}`} className="contact-phone-link">
                              {donorPhone}
                            </a>
                          </span>
                        </div>
                      )}

                      <div className="detail-row">
                        <MapPin size={16} className="detail-icon" />
                        <span className="truncate-text"><strong>Pickup:</strong> {address}{city ? `, ${city}` : ''}</span>
                      </div>

                      <div className="detail-row">
                        <Clock size={16} className="detail-icon" />
                        <span><strong>Deadline:</strong> {expiry}</span>
                      </div>
                    </div>

                    <div className="reserved-banner">
                      <Clock size={14} />
                      <span>Reserved on {reservedAt}</span>
                    </div>

                    <div className="listing-actions">
                      <Link to={`/food/${foodId}`} className="btn-secondary listing-btn full-width">
                        <span>View Pickup Instructions</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RecipientDashboard;
