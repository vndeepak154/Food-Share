const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Food = sequelize.define('Food', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  donorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  foodName: {
    type: DataTypes.STRING,
    allowNull: false
    // E.g., "Biryani", "Vegetables", "Bread"
  },
  category: {
    type: DataTypes.ENUM('cooked', 'raw', 'packaged', 'drinks'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.STRING,
    allowNull: false
    // E.g., "5 kg", "20 pieces", "50 liters"
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
    // Additional details about the food
  },
  preparationTime: {
    type: DataTypes.DATE,
    allowNull: true
    // When was it prepared
  },
  expiryTime: {
    type: DataTypes.DATE,
    allowNull: false
    // When should it be picked up by
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
    // Array of image URLs
  },
  locationAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  locationCity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('available', 'reserved', 'taken', 'expired'),
    defaultValue: 'available'
  },
  reservedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  reservedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  takenAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: true
    // Name of person to contact for pickup
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true
    // Phone number
  },
  specialRequirements: {
    type: DataTypes.STRING,
    allowNull: true
    // E.g., "requires cold storage", "halal"
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    { fields: ['latitude', 'longitude'] },
    { fields: ['status', 'expiryTime'] }
  ]
});

// Associations
Food.belongsTo(User, { as: 'donor', foreignKey: 'donorId' });
Food.belongsTo(User, { as: 'reservedBy', foreignKey: 'reservedById' });

module.exports = Food;
