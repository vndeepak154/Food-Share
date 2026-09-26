import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Sparkles,
  Save,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import '../styles/Form.css';

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    specialRequirements: '',
    status: 'available'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Format Date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    const fetchFood = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/foods/${id}`);
        const food = res.data;
        setFormData({
          foodName: food.foodName || '',
          category: food.category || 'cooked',
          quantity: food.quantity || '',
          description: food.description || '',
          preparationTime: formatForInput(food.preparationTime),
          expiryTime: formatForInput(food.expiryTime),
          address: food.locationAddress || food.location?.address || food.address || '',
          city: food.locationCity || food.location?.city || food.city || '',
          latitude: food.latitude !== undefined ? String(food.latitude) : '',
          longitude: food.longitude !== undefined ? String(food.longitude) : '',
          contactPerson: food.contactPerson || '',
          contactPhone: food.contactPhone || '',
          specialRequirements: food.specialRequirements || '',
          status: food.status || 'available'
        });
      } catch (err) {
        setError('Failed to load food details for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id, API_BASE_URL]);

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

  // Helper to extend expiry time easily
  const extendExpiryHours = (hours) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    setFormData(prev => ({
      ...prev,
      expiryTime: formatForInput(now)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSuccess('');

    try {
      await axios.put(`${API_BASE_URL}/foods/${id}`, {
        ...formData,
        latitude: parseFloat(formData.latitude || '0'),
        longitude: parseFloat(formData.longitude || '0')
      });

      setSuccess('Food listing updated successfully! Recipients can now see the updated details.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update food listing. Please check required fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this food listing?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/foods/${id}`);
      alert('Listing deleted.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  const categories = [
    { id: 'cooked', label: 'Cooked Meals', icon: UtensilsCrossed, desc: 'Prepared dishes, curries, rice' },
    { id: 'raw', label: 'Raw Ingredients', icon: Apple, desc: 'Fresh produce, grains, raw supplies' },
    { id: 'packaged', label: 'Packaged Goods', icon: Package, desc: 'Sealed snacks, canned food, bread' },
    { id: 'drinks', label: 'Beverages', icon: Coffee, desc: 'Juices, water, milk, sealed drinks' }
  ];

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span>Loading listing for edit...</span>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <Link to="/dashboard" className="form-back-nav">
        <ArrowLeft size={16} />
        <span>Return to Dashboard</span>
      </Link>

      <div className="form-surface-card">
        <div className="form-surface-header">
          <div className="form-header-badge">
            <Sparkles size={14} />
            <span>Donor Management</span>
          </div>
          <h1 className="form-page-title">Edit Food <span className="gradient-text">Listing</span></h1>
          <p className="form-page-subtitle">
            Update your food details, quantities, pickup deadline, or status. Updates will be visible in real-time to recipients.
          </p>
        </div>

        {success && (
          <div className="success-message">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="corporate-form">
          {/* Status selector */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">1. Listing Status</legend>
            <div className="form-group-corporate">
              <label htmlFor="status">Current Status *</label>
              <select 
                id="status" 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                style={{ fontWeight: 600 }}
              >
                <option value="available">🟢 Available (Visible to all recipients)</option>
                <option value="reserved">🟡 Reserved (Awaiting pickup)</option>
                <option value="taken">⚪ Taken / Completed</option>
                <option value="expired">🔴 Expired</option>
              </select>
            </div>
          </fieldset>

          {/* Section 2: Food Info */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">2. Food Information</legend>

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

          {/* Section 3: Timing */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">3. Timing & Pickup Deadline</legend>

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

                {/* Quick Extend Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Quick Set:</span>
                  <button type="button" className="chip-btn" onClick={() => extendExpiryHours(4)}>+4 Hours</button>
                  <button type="button" className="chip-btn" onClick={() => extendExpiryHours(12)}>+12 Hours</button>
                  <button type="button" className="chip-btn" onClick={() => extendExpiryHours(24)}>+24 Hours</button>
                  <button type="button" className="chip-btn" onClick={() => extendExpiryHours(48)}>+2 Days</button>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Section 4: Location */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">4. Pickup Location</legend>

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

          {/* Section 5: Contact */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">5. On-Site Pickup Contact</legend>

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

          {/* Actions */}
          <div className="form-submit-row" style={{ justifyContent: 'space-between' }}>
            <button 
              type="button" 
              onClick={handleDelete}
              className="btn-secondary"
              style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-border)' }}
            >
              <Trash2 size={16} />
              <span>Delete Listing</span>
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/dashboard" className="btn-secondary">
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="btn-primary form-cta-btn">
                {saving ? (
                  <>
                    <div className="spinner-sm" />
                    <span>Saving Updates...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save & Update Listing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditListing;
