const express = require('express');
const { Op } = require('sequelize');
const Food = require('../models/Food');
const User = require('../models/User');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Create food listing (Donors only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      foodName, 
      category, 
      quantity, 
      description,
      preparationTime,
      expiryTime,
      address,
      city,
      latitude,
      longitude,
      contactPerson,
      contactPhone,
      specialRequirements,
      images
    } = req.body;

    // Validation
    if (!foodName || !category || !quantity || !expiryTime || !address || !city) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const lat = (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) ? parseFloat(latitude) : 0;
    const lng = (longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) ? parseFloat(longitude) : 0;

    const food = await Food.create({
      donorId: req.user.userId,
      foodName,
      category,
      quantity,
      description,
      preparationTime: preparationTime ? new Date(preparationTime) : null,
      expiryTime: new Date(expiryTime),
      images: images || [],
      locationAddress: address,
      locationCity: city,
      latitude: lat,
      longitude: lng,
      contactPerson,
      contactPhone,
      specialRequirements
    });

    // Fetch with donor details
    const foodWithDonor = await Food.findByPk(food.id, {
      include: { association: 'donor', attributes: ['id', 'name', 'organizationName', 'phone'] }
    });

    res.status(201).json({
      message: 'Food listing created successfully',
      food: foodWithDonor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search nearby foods (Location-based)
router.get('/search', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    // Simple distance calculation (Haversine formula approximation)
    // For more accuracy, use spatial indexes or PostGIS
    const foods = await Food.findAll({
      where: {
        status: 'available'
      },
      include: { association: 'donor', attributes: ['id', 'name', 'organizationName', 'phone', 'address', 'city'] },
      order: [['createdAt', 'DESC']]
    });

    // Filter by distance (simple Haversine)
    const nearby = foods.filter(food => {
      if (!food.latitude || !food.longitude) return false;
      const R = 6371; // Earth's radius in km
      const dLat = (food.latitude - lat) * Math.PI / 180;
      const dLng = (food.longitude - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(food.latitude * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= rad;
    });

    res.json({
      count: nearby.length,
      foods: nearby
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all available foods (with pagination, city, category filters)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, city, category } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      status: 'available'
    };

    if (city && city.trim()) {
      where.locationCity = { [Op.like]: `%${city.trim()}%` };
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const { count, rows } = await Food.findAndCountAll({
      where,
      include: { association: 'donor', attributes: ['id', 'name', 'organizationName', 'phone', 'address', 'city'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      foods: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update food listing (Donors only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    // Only donor who created it can update
    if (food.donorId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const {
      foodName,
      category,
      quantity,
      description,
      preparationTime,
      expiryTime,
      address,
      city,
      latitude,
      longitude,
      contactPerson,
      contactPhone,
      specialRequirements,
      status
    } = req.body;

    const updateData = {};
    if (foodName !== undefined) updateData.foodName = foodName;
    if (category !== undefined) updateData.category = category;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (description !== undefined) updateData.description = description;
    if (preparationTime !== undefined) updateData.preparationTime = preparationTime ? new Date(preparationTime) : null;
    if (expiryTime !== undefined) updateData.expiryTime = new Date(expiryTime);
    if (address !== undefined) updateData.locationAddress = address;
    if (city !== undefined) updateData.locationCity = city;
    if (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) updateData.longitude = parseFloat(longitude);
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (specialRequirements !== undefined) updateData.specialRequirements = specialRequirements;
    if (status !== undefined) updateData.status = status;

    await food.update(updateData);

    const updatedFood = await Food.findByPk(food.id, {
      include: { association: 'donor', attributes: ['id', 'name', 'organizationName', 'phone', 'address', 'city'] }
    });

    res.json({
      message: 'Food listing updated successfully',
      food: updatedFood
    });
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete food listing (Donors only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    if (food.donorId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await food.destroy();

    res.json({ message: 'Food listing deleted successfully' });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single food listing
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id, {
      include: { association: 'donor', attributes: ['id', 'name', 'organizationName', 'phone', 'address', 'city', 'email'] }
    });

    if (!food) {
      return res.status(404).json({ message: 'Food listing not found' });
    }

    res.json(food);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reserve food (Recipients only)
router.post('/:id/reserve', authenticateToken, async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.status !== 'available') {
      return res.status(400).json({ message: 'Food is not available' });
    }

    await food.update({
      status: 'reserved',
      reservedById: req.user.userId,
      reservedAt: new Date()
    });

    const updatedFood = await Food.findByPk(food.id, {
      include: { association: 'donor', attributes: ['id', 'name', 'organizationName', 'phone'] }
    });

    res.json({
      message: 'Food reserved successfully',
      food: updatedFood
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark food as taken / delivered (Donors only)
const handleMarkDelivered = async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Only donor who created the listing can mark as delivered
    if (food.donorId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await food.update({
      status: 'taken',
      takenAt: new Date()
    });

    const updatedFood = await Food.findByPk(food.id, {
      include: [
        { association: 'donor', attributes: ['id', 'name', 'organizationName', 'phone'] },
        { association: 'reservedBy', attributes: ['id', 'name', 'organizationName', 'phone', 'email'] }
      ]
    });

    res.json({
      message: 'Food marked as delivered successfully',
      food: updatedFood
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

router.post('/:id/mark-taken', authenticateToken, handleMarkDelivered);
router.post('/:id/mark-delivered', authenticateToken, handleMarkDelivered);

// Get my listings (for donors - includes recipient details if reserved/delivered)
router.get('/user/my-listings', authenticateToken, async (req, res) => {
  try {
    const foods = await Food.findAll({
      where: { donorId: req.user.userId },
      include: [
        { association: 'reservedBy', attributes: ['id', 'name', 'organizationName', 'phone', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      count: foods.length,
      foods
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my reservations (for recipients)
router.get('/user/my-reservations', authenticateToken, async (req, res) => {
  try {
    const foods = await Food.findAll({
      where: { reservedById: req.user.userId },
      include: { association: 'donor', attributes: ['id', 'name', 'organizationName', 'phone', 'address'] },
      order: [['reservedAt', 'DESC']]
    });

    res.json({
      count: foods.length,
      foods
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
