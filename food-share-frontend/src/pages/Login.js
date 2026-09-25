import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  UtensilsCrossed, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import '../styles/Auth.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      onLogin(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Decorative Orbs */}
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />

      <div className="auth-card-container">
        {/* Left / Top Branding Panel */}
        <div className="auth-brand-badge">
          <div className="auth-logo-icon">
            <UtensilsCrossed size={22} />
          </div>
          <span className="auth-brand-name">Food<span className="gradient-text">Share</span></span>
        </div>

        <div className="auth-header-text">
          <h1 className="auth-title">Welcome <span className="gradient-text">Back</span></h1>
          <p className="auth-subtitle">
            Sign in to access your donation dashboard and food distribution network.
          </p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-corporate">
            <label htmlFor="login-email">Work or Personal Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group-corporate">
            <div className="label-with-hint">
              <label htmlFor="login-password">Password</label>
            </div>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
            {loading ? (
              <>
                <div className="spinner-sm" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Enterprise Trust Proof */}
        <div className="auth-trust-banner">
          <ShieldCheck size={16} className="trust-icon" />
          <span>Verified Non-Profit & Enterprise Food Safety Network</span>
        </div>

        <div className="auth-footer-prompt">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch-link">
              Register your organization
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
