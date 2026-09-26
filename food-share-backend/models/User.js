const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    len: [6, 255]
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userType: {
    type: DataTypes.ENUM('donor', 'recipient'),
    allowNull: false,
    defaultValue: 'donor'
    // donor = hotels, marriages, restaurants, families
    // recipient = NGOs, orphanages, homeless shelters
  },
  organizationName: {
    type: DataTypes.STRING,
    allowNull: false
    // E.g., "Hotel Taj", "XYZ NGO", "Family (Ahmed's)"
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true
    // What does the org do, their mission
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
    // For NGOs, orphanages - manual verification
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
