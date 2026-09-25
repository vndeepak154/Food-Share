import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  UtensilsCrossed, 
  MapPin, 
  Clock, 
  Building2, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  BookmarkCheck,
  CheckCheck,
  AlertTriangle,
  Pencil
} from 'lucide-react';
import '../styles/Details.css';

function FoodDetails({ user }) {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const navigate = useNavigate();

  useEffect(() => {
    fetchFood();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchFood = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/foods/${id}`);
      setFood(response.data);
    } catch (err) {
      setError('Failed to load food details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reserveFood = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(`${API_BASE_URL}/foods/${id}/reserve`);
      setFood(response.data.food);
      setActionSuccess('Food reserved successfully! Please coordinate with the donor for pickup.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve food');
    } finally {
      setActionLoading(false);
    }
  };

  const markAsTaken = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(`${API_BASE_URL}/foods/${id}/mark-taken`);
      setFood(response.data.food);
      setActionSuccess('Food status marked as collected/taken!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span>Loading donation details...</span>
      </div>
    );
  }

  if (error && !food) {
    return (
      <div className="details-container">
        <Link to="/dashboard" className="details-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
        <div className="error-message">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="details-container">
        <div className="empty-state">
          <h3>Food Listing Not Found</h3>
          <p>The requested food listing may have expired or been removed.</p>
          <Link to="/dashboard" className="btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Schema-safe property extractors
  const donorId = food.donorId || food.donor?.id || food.donor?._id;
  const isDonor = user?.userType === 'donor' && donorId === user.id;
  const isRecipient = user?.userType === 'recipient';
  const address = food.locationAddress || food.location?.address || food.address || 'Address provided upon request';
  const city = food.locationCity || food.location?.city || food.city || '';
  const donorName = food.donor?.organizationName || food.donor?.name || 'Verified Donor';
  const donorPhone = food.contactPhone || food.donor?.phone;
  const expiry = new Date(food.expiryTime).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short'
  });
  const prepTime = food.preparationTime ? new Date(food.preparationTime).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }) : null;

  return (
    <div className="details-container">
      {/* Back button */}
      <button type="button" onClick={() => navigate(-1)} className="details-back-btn">
        <ArrowLeft size={16} />
        <span>Back to listings</span>
      </button>

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

      <div className="details-main-card">
        {/* Header */}
        <div className="details-card-header">
          <div className="details-header-info">
            <span className="details-category-pill">{food.category}</span>
            <h1 className="details-food-name">{food.foodName}</h1>
            <p className="details-donor-sub">Donated by <strong>{donorName}</strong></p>
          </div>
          <span className={`status-pill status-${food.status} status-pill-large`}>
            {food.status}
          </span>
        </div>

        {/* Informative 3-Column Grid */}
        <div className="details-info-grid">
          {/* Section 1: Food Details */}
          <div className="info-block-card">
            <div className="info-block-header">
              <div className="info-icon-pill">
                <UtensilsCrossed size={18} />
              </div>
              <h3>Food Details</h3>
            </div>
            <div className="info-block-content">
              <div className="info-item">
                <span className="info-item-label">Quantity / Portions</span>
                <span className="info-item-val">{food.quantity}</span>
              </div>
              <div className="info-item">
                <span className="info-item-label">Category</span>
                <span className="info-item-val" style={{ textTransform: 'capitalize' }}>{food.category}</span>
              </div>
              {food.specialRequirements && (
                <div className="info-item">
                  <span className="info-item-label">Handling & Storage</span>
                  <span className="info-item-val highlight-badge">{food.specialRequirements}</span>
                </div>
              )}
              {food.description && (
                <div className="info-item">
                  <span className="info-item-label">Description</span>
                  <p className="info-item-desc">{food.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Donor Contact */}
          <div className="info-block-card">
            <div className="info-block-header">
              <div className="info-icon-pill">
                <Building2 size={18} />
              </div>
              <h3>Donor Information</h3>
            </div>
            <div className="info-block-content">
              <div className="info-item">
                <span className="info-item-label">Organization Name</span>
                <span className="info-item-val">{donorName}</span>
              </div>
              {food.contactPerson && (
                <div className="info-item">
                  <span className="info-item-label">Contact Person</span>
                  <span className="info-item-val">{food.contactPerson}</span>
                </div>
              )}
              {donorPhone && (
                <div className="info-item">
                  <span className="info-item-label">Phone for Pickup</span>
                  <a href={`tel:${donorPhone}`} className="info-phone-link">
                    <Phone size={14} />
                    <span>{donorPhone}</span>
                  </a>
                </div>
              )}
              <div className="verification-proof">
                <ShieldCheck size={16} className="verified-icon" />
                <span>Verified Food Donor</span>
              </div>
            </div>
          </div>

          {/* Section 3: Location & Timing */}
          <div className="info-block-card">
            <div className="info-block-header">
              <div className="info-icon-pill">
                <MapPin size={18} />
              </div>
              <h3>Pickup & Timing</h3>
            </div>
            <div className="info-block-content">
              <div className="info-item">
                <span className="info-item-label">Address</span>
                <span className="info-item-val">{address}{city ? `, ${city}` : ''}</span>
              </div>
              {prepTime && (
                <div className="info-item">
                  <span className="info-item-label">Prepared At</span>
                  <span className="info-item-val">{prepTime}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-item-label">Must Pick Up By</span>
                <span className="info-item-val expiry-accent">
                  <Clock size={15} />
                  <span>{expiry}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="details-actions-bar">
          {isDonor && (
            <Link 
              to={`/edit-listing/${food.id || id}`} 
              className="btn-secondary details-cta"
            >
              <Pencil size={18} />
              <span>Edit / Update Listing</span>
            </Link>
          )}

          {isRecipient && food.status === 'available' && (
            <button 
              type="button" 
              className="btn-primary details-cta" 
              onClick={reserveFood}
              disabled={actionLoading}
            >
              <BookmarkCheck size={18} />
              <span>{actionLoading ? 'Reserving...' : 'Reserve This Food Now'}</span>
            </button>
          )}

          {isDonor && food.status === 'reserved' && (
            <button 
              type="button" 
              className="btn-success details-cta" 
              onClick={markAsTaken}
              disabled={actionLoading}
            >
              <CheckCheck size={18} />
              <span>{actionLoading ? 'Updating...' : 'Mark as Picked Up / Taken'}</span>
            </button>
          )}

          {food.status === 'taken' && (
            <div className="details-state-note">
              <CheckCircle2 size={18} />
              <span>This food has already been collected and fulfilled.</span>
            </div>
          )}

          {food.status === 'expired' && (
            <div className="details-state-note expired">
              <AlertTriangle size={18} />
              <span>This listing has passed its expiry window.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodDetails;
