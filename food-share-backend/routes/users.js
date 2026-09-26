const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, description, address, city, latitude, longitude } = req.body;

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only provided fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (description) user.description = description;
    if (address) user.address = address;
    if (city) user.city = city;
    if (latitude !== undefined && latitude !== '' && !isNaN(Number(latitude))) user.latitude = parseFloat(latitude);
    if (longitude !== undefined && longitude !== '' && !isNaN(Number(longitude))) user.longitude = parseFloat(longitude);

    await user.save();

    // Return without password
    const { password, ...userWithoutPassword } = user.toJSON();
    
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get public user profile (for viewing donor/recipient details)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all NGOs/Orphanages (for admin/verification)
router.get('/organizations/recipients', async (req, res) => {
  try {
    const recipients = await User.findAll({
      where: { 
        userType: 'recipient',
        verified: true
      },
      attributes: { exclude: ['password'] }
    });

    res.json({
      count: recipients.length,
      recipients
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
