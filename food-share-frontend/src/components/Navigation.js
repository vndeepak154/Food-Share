import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  LayoutDashboard, 
  PlusCircle, 
  MapPin, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  Building2,
  HeartHandshake
} from 'lucide-react';
import '../styles/Navigation.css';

function Navigation({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const isDonor = user?.userType === 'donor';

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/dashboard" className="nav-brand">
          <div className="brand-icon-box">
            <UtensilsCrossed className="brand-icon" size={20} />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">Food<span className="gradient-text">Share</span></span>
            <span className="brand-badge">Enterprise</span>
          </div>
        </Link>

        {/* Primary Links */}
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </Link>
          </li>
          
          {isDonor && (
            <li className="nav-item">
              <Link 
                to="/create-listing" 
                className={`nav-link nav-link-highlight ${isActive('/create-listing') ? 'active' : ''}`}
              >
                <PlusCircle size={17} />
                <span>Create Listing</span>
              </Link>
            </li>
          )}

          <li className="nav-item">
            <Link 
              to="/map" 
              className={`nav-link ${isActive('/map') ? 'active' : ''}`}
            >
              <MapPin size={17} />
              <span>Food Map</span>
            </Link>
          </li>
        </ul>

        {/* User Profile Pill & Dropdown */}
        <div className="nav-user-section" ref={dropdownRef}>
          <button 
            type="button"
            className={`user-profile-button ${dropdownOpen ? 'open' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="user-avatar-circle">
              {userInitial}
            </div>
            <div className="user-info-text">
              <span className="user-name">{user?.name || 'My Account'}</span>
              <span className="user-role-badge">
                {isDonor ? <Building2 size={11} /> : <HeartHandshake size={11} />}
                {isDonor ? 'Donor' : 'Recipient'}
              </span>
            </div>
            <ChevronDown size={15} className={`chevron-icon ${dropdownOpen ? 'rotate' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu-corporate">
              <div className="dropdown-user-header">
                <p className="dropdown-user-name">{user?.name}</p>
                <p className="dropdown-user-org">{user?.organizationName || user?.email}</p>
              </div>
              <div className="dropdown-divider" />
              <Link 
                to="/profile" 
                className="dropdown-item-corporate"
                onClick={() => setDropdownOpen(false)}
              >
                <UserIcon size={16} />
                <span>Account Profile</span>
              </Link>
              <div className="dropdown-divider" />
              <button 
                type="button"
                onClick={handleLogout}
                className="dropdown-item-corporate logout"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
