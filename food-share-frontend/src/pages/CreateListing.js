import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  UtensilsCrossed, 
  Package, 
  Apple, 
  Coffee, 
  MapPin, 
  Clock, 
  Calendar, 
  Phone, 
  User as UserIcon, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles
} from 'lucide-react';
import '../styles/Form.css';

function CreateListing() {
  const [formData, setFormData] = useState({
    foodName: '',
    category: 'cooked',
    quantity: '',
    description: '',
    preparationTime: '',
    expiryTime: '',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    contactPerson: '',
    contactPhone: '',
    specialRequirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setCategory = (cat) => {
    setFormData(prev => ({ ...prev, category: cat }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/foods`, {
        ...formData,
        latitude: parseFloat(formData.latitude || '0'),
        longitude: parseFloat(formData.longitude || '0')
      });

      alert('Food donation listing published successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create food listing. Please check required fields.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'cooked', label: 'Cooked Meals', icon: UtensilsCrossed, desc: 'Prepared dishes, curries, rice' },
    { id: 'raw', label: 'Raw Ingredients', icon: Apple, desc: 'Fresh produce, grains, raw supplies' },
    { id: 'packaged', label: 'Packaged Goods', icon: Package, desc: 'Sealed snacks, canned food, bread' },
    { id: 'drinks', label: 'Beverages', icon: Coffee, desc: 'Juices, water, milk, sealed drinks' }
  ];

  return (
    <div className="form-page-container">
      {/* Top Navigation Back Link */}
      <Link to="/dashboard" className="form-back-nav">
        <ArrowLeft size={16} />
        <span>Return to Dashboard</span>
      </Link>

      <div className="form-surface-card">
        {/* Header */}
        <div className="form-surface-header">
          <div className="form-header-badge">
            <Sparkles size={14} />
            <span>Surplus Sharing</span>
          </div>
          <h1 className="form-page-title">Publish Food <span className="gradient-text">Donation</span></h1>
          <p className="form-page-subtitle">
            Provide details about your surplus food so nearby verified shelters and food banks can claim it quickly.
          </p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="corporate-form">
          {/* Section 1: Food Details */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">1. Food Information</legend>

            <div className="form-group-corporate">
              <label htmlFor="foodName">Food Item Name *</label>
              <input
                id="foodName"
                type="text"
                name="foodName"
                placeholder="e.g., Vegetable Biryani & Raita (50 Servings)"
                value={formData.foodName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Interactive Category Selector Cards */}
            <div className="form-group-corporate">
              <label>Food Category *</label>
              <div className="category-cards-grid">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.id;
                  return (
                    <div 
                      key={cat.id}
                      className={`category-select-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setCategory(cat.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="cat-icon-box">
                        <Icon size={20} />
                      </div>
                      <div className="cat-text-group">
                        <div className="cat-name">{cat.label}</div>
                        <div className="cat-sub">{cat.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group-corporate">
                <label htmlFor="quantity">Quantity / Servings *</label>
                <input
                  id="quantity"
                  type="text"
                  name="quantity"
                  placeholder="e.g., 20 kg / 45 meals"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-corporate">
                <label htmlFor="specialRequirements">Storage / Handling Notes</label>
                <input
                  id="specialRequirements"
                  type="text"
                  name="specialRequirements"
                  placeholder="e.g., Keep refrigerated, Vegetarian"
                  value={formData.specialRequirements}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group-corporate">
              <label htmlFor="description">Detailed Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Share any helpful details: ingredients, packaging container requirements, or allergen warnings..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          {/* Section 2: Timing & Pickup Window */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">2. Timing & Expiry Schedule</legend>

            <div className="form-grid-2col">
              <div className="form-group-corporate">
                <label htmlFor="preparationTime">Prepared / Cooked At</label>
                <div className="input-with-icon">
                  <Clock className="input-icon" size={17} />
                  <input
                    id="preparationTime"
                    type="datetime-local"
                    name="preparationTime"
                    value={formData.preparationTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group-corporate">
                <label htmlFor="expiryTime">Must Pick Up By (Expiry) *</label>
                <div className="input-with-icon">
                  <Calendar className="input-icon" size={17} />
                  <input
                    id="expiryTime"
                    type="datetime-local"
                    name="expiryTime"
                    value={formData.expiryTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Section 3: Location Details */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">3. Pickup Location</legend>

            <div className="form-grid-2col">
              <div className="form-group-corporate">
                <label htmlFor="address">Street Address *</label>
                <div className="input-with-icon">
                  <MapPin className="input-icon" size={17} />
                  <input
                    id="address"
                    type="text"
                    name="address"
                    placeholder="e.g., Banquet Hall B, 104 Grand Avenue"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group-corporate">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="e.g., Delhi, Mumbai, New York"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </fieldset>

          {/* Section 4: Contact Point */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">4. On-Site Contact for Pickup</legend>

            <div className="form-grid-2col">
              <div className="form-group-corporate">
                <label htmlFor="contactPerson">Contact Person Name</label>
                <div className="input-with-icon">
                  <UserIcon className="input-icon" size={17} />
                  <input
                    id="contactPerson"
                    type="text"
                    name="contactPerson"
                    placeholder="e.g., Kitchen Manager John"
                    value={formData.contactPerson}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group-corporate">
                <label htmlFor="contactPhone">Contact Phone Number</label>
                <div className="input-with-icon">
                  <Phone className="input-icon" size={17} />
                  <input
                    id="contactPhone"
                    type="tel"
                    name="contactPhone"
                    placeholder="+1 (555) 234-5678"
                    value={formData.contactPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Action Buttons */}
          <div className="form-submit-row">
            <Link to="/dashboard" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn-primary form-cta-btn">
              {loading ? (
                <>
                  <div className="spinner-sm" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <>
                  <span>Publish Food Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateListing;
