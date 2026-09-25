import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { 
  MapPin, 
  ArrowLeft, 
  Building2, 
  Clock, 
  ArrowRight,
  Package
} from 'lucide-react';
import '../styles/MapView.css';

// Fix for default Leaflet marker icon in React bundles
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapView() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/foods`);
        setFoods(response.data.foods || []);
      } catch (err) {
        console.error('Error fetching foods for map:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, [API_BASE_URL]);

  // Valid geo-located foods
  const mapFoods = foods.filter(food => {
    const lat = food.latitude || food.location?.latitude;
    const lng = food.longitude || food.location?.longitude;
    return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
  });

  // Calculate center coordinate
  const defaultCenter = mapFoods.length > 0
    ? [mapFoods[0].latitude || mapFoods[0].location?.latitude, mapFoods[0].longitude || mapFoods[0].location?.longitude]
    : [28.6139, 77.2090]; // Default New Delhi

  return (
    <div className="map-page-wrapper">
      {/* Header bar */}
      <div className="map-page-header">
        <div className="map-header-left">
          <Link to="/dashboard" className="map-back-link">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </Link>
          <div className="map-title-row">
            <h1 className="map-main-title">Regional Food <span className="gradient-text">Map</span></h1>
            <span className="map-counter-badge">
              <MapPin size={13} />
              <span>{mapFoods.length} Live Donation Pins</span>
            </span>
          </div>
        </div>

        <div className="map-legend-group">
          <span className="legend-chip">
            <span className="legend-dot available" />
            <span>Available Pickup</span>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="loading" style={{ minHeight: '50vh' }}>
          <div className="spinner" />
          <span>Rendering regional map...</span>
        </div>
      ) : (
        <div className="map-frame-card">
          <MapContainer 
            center={defaultCenter} 
            zoom={mapFoods.length > 0 ? 9 : 5} 
            className="leaflet-map-frame"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {mapFoods.map(food => {
              const foodId = food.id || food._id;
              const lat = food.latitude || food.location?.latitude;
              const lng = food.longitude || food.location?.longitude;
              const donorName = food.donor?.organizationName || food.donor?.name || 'Partner Donor';
              const address = food.locationAddress || food.location?.address || food.address || '';
              const city = food.locationCity || food.location?.city || food.city || '';
              const expiry = new Date(food.expiryTime).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              return (
                <Marker key={foodId} position={[lat, lng]}>
                  <Popup className="corporate-map-popup">
                    <div className="popup-inner">
                      <span className="popup-cat">{food.category}</span>
                      <h4 className="popup-title">{food.foodName}</h4>
                      
                      <div className="popup-meta">
                        <div className="popup-row">
                          <Building2 size={13} />
                          <span>{donorName}</span>
                        </div>
                        <div className="popup-row">
                          <Package size={13} />
                          <span>{food.quantity}</span>
                        </div>
                        <div className="popup-row">
                          <Clock size={13} />
                          <span>Pick up by: {expiry}</span>
                        </div>
                        {address && (
                          <div className="popup-row">
                            <MapPin size={13} />
                            <span>{address}{city ? `, ${city}` : ''}</span>
                          </div>
                        )}
                      </div>

                      <Link to={`/food/${foodId}`} className="popup-cta-btn">
                        <span>View Details</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default MapView;
