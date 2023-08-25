const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { verifyToken } = require('../utils/authUtils');

// Get all users (requires authentication)
router.get('/', verifyToken, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a user by ID (requires authentication)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id, { password: 0 });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
