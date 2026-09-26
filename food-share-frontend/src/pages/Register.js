import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  UtensilsCrossed, 
  Building2, 
  HeartHandshake, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Compass, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';
import '../styles/Auth.css';

function Register({ onRegister }) {
  const [userType, setUserType] = useState('donor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    organizationName: '',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        ...formData,
        userType,
        latitude: parseFloat(formData.latitude || '0'),
        longitude: parseFloat(formData.longitude || '0')
      });

      onRegister(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check the entered data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />

      <div className="auth-card-container register-card-container">
        {/* Brand */}
        <div className="auth-brand-badge">
          <div className="auth-logo-icon">
            <UtensilsCrossed size={22} />
          </div>
          <span className="auth-brand-name">Food<span className="gradient-text">Share</span></span>
        </div>

        <div className="auth-header-text">
          <h1 className="auth-title">Create an <span className="gradient-text">Account</span></h1>
          <p className="auth-subtitle">
            Join the verified network to donate surplus food or receive supplies for your community.
          </p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* User Type Card Toggle */}
        <div className="role-selector-container">
          <div 
            className={`role-option-card ${userType === 'donor' ? 'active' : ''}`}
            onClick={() => setUserType('donor')}
            role="button"
            tabIndex={0}
          >
            <div className="role-icon-box">
              <Building2 size={20} />
            </div>
            <div className="role-text-box">
              <div className="role-title">Food Donor</div>
              <div className="role-desc">Hotels, restaurants, event caterers & businesses</div>
            </div>
          </div>

          <div 
            className={`role-option-card ${userType === 'recipient' ? 'active' : ''}`}
            onClick={() => setUserType('recipient')}
            role="button"
            tabIndex={0}
          >
            <div className="role-icon-box">
              <HeartHandshake size={20} />
            </div>
            <div className="role-text-box">
              <div className="role-title">Food Recipient</div>
              <div className="role-desc">NGOs, orphanages, shelters & food banks</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid-2col">
            <div className="form-group-corporate">
              <label>Contact Person Name</label>
              <div className="input-with-icon">
                <UserIcon className="input-icon" size={17} />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Alex Johnson"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group-corporate">
              <label>{userType === 'donor' ? 'Business / Venue Name' : 'NGO / Shelter Name'}</label>
              <div className="input-with-icon">
                <Building2 className="input-icon" size={17} />
                <input
                  type="text"
                  name="organizationName"
                  placeholder={userType === 'donor' ? 'Grand Plaza Hotel' : 'Hope Food Bank'}
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group-corporate">
              <label>Work Email</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={17} />
                <input
                  type="email"
                  name="email"
                  placeholder="contact@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group-corporate">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={17} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group-corporate">
            <label>Account Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={17} />
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group-corporate">
              <label>Street Address</label>
              <div className="input-with-icon">
                <MapPin className="input-icon" size={17} />
                <input
                  type="text"
                  name="address"
                  placeholder="123 Community Way"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group-corporate">
              <label>City</label>
              <div className="input-with-icon">
                <Compass className="input-icon" size={17} />
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. New York, Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group-corporate">
            <label>Organization Description (Optional)</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder={userType === 'donor' ? 'Types of surplus food you typically provide...' : 'How your organization serves the community...'}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
            {loading ? (
              <>
                <div className="spinner-sm" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <p>
            Already registered?{' '}
            <Link to="/login" className="auth-switch-link">
              Sign into existing account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
