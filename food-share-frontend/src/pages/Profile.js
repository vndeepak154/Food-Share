import React, { useState } from 'react';
import axios from 'axios';
import { 
  User as UserIcon, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Save
} from 'lucide-react';
import '../styles/Form.css';

function Profile({ user, setUser }) {
  const [formData, setFormData] = useState(user || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, {
        ...formData,
        latitude: parseFloat(formData.latitude || '0'),
        longitude: parseFloat(formData.longitude || '0')
      });
      setUser(response.data.user);
      setMessage('Profile settings updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError('Error saving profile changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const userInitial = formData.name ? formData.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="form-page-container">
      <div className="form-surface-card profile-card-max">
        {/* Profile Avatar & Header */}
        <div className="profile-banner-header">
          <div className="profile-avatar-large">
            {userInitial}
          </div>
          <div className="profile-info-block">
            <div className="profile-name-row">
              <h1 className="profile-user-name">{formData.name || 'Account Settings'}</h1>
              <span className="profile-verified-badge">
                <ShieldCheck size={14} />
                <span>Verified {formData.userType}</span>
              </span>
            </div>
            <p className="profile-user-org">{formData.organizationName || formData.email}</p>
          </div>
        </div>

        {message && (
          <div className="success-message">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="corporate-form">
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">Account & Organization Details</legend>

            <div className="form-grid-2col">
              <div className="form-group-corporate">
                <label>Primary Contact Name</label>
                <div className="input-with-icon">
                  <UserIcon className="input-icon" size={17} />
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name || ''} 
                    onChange={handleChange} 
                    placeholder="e.g., Alex Johnson"
                    required 
                  />
                </div>
              </div>

              <div className="form-group-corporate">
                <label>Organization / Business Name</label>
                <div className="input-with-icon">
                  <Building2 className="input-icon" size={17} />
                  <input 
                    type="text" 
                    name="organizationName" 
                    value={formData.organizationName || ''} 
                    onChange={handleChange} 
                    placeholder="e.g., Grand Plaza Hotel or Hope Food Bank"
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group-corporate">
                <label>Registered Email Address</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={17} />
                  <input 
                    type="email" 
                    value={formData.email || ''} 
                    disabled 
                    placeholder="email@organization.com"
                    style={{ backgroundColor: '#F1F5F9', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="form-group-corporate">
                <label>Contact Phone Number</label>
                <div className="input-with-icon">
                  <Phone className="input-icon" size={17} />
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleChange} 
                    placeholder="+1 (555) 000-0000"
                    required 
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">Location & Address</legend>

            <div className="form-grid-2col">
              <div className="form-group-corporate">
                <label>Address</label>
                <div className="input-with-icon">
                  <MapPin className="input-icon" size={17} />
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address || ''} 
                    onChange={handleChange} 
                    placeholder="e.g., 123 Community Way"
                    required 
                  />
                </div>
              </div>

              <div className="form-group-corporate">
                <label>City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city || ''} 
                  onChange={handleChange} 
                  placeholder="e.g., New York, Mumbai"
                  required 
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">About Your Operations</legend>
            <div className="form-group-corporate">
              <label>Organization Description</label>
              <textarea 
                name="description" 
                rows={3}
                value={formData.description || ''} 
                onChange={handleChange} 
                placeholder="Share more about your mission or capacity..."
              />
            </div>
          </fieldset>

          <div className="form-submit-row">
            <button type="submit" disabled={loading} className="btn-primary form-cta-btn">
              {loading ? (
                <>
                  <div className="spinner-sm" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
