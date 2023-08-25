const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../utils/authUtils');
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
    // Validate the request body
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        // Check if the email already exists
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) return res.status(400).json({ message: 'Email already exists' });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create a new user
        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role,
        });

        // Save the user to the database
        const savedUser = await user.save();

        // Create and sign a JWT token
        const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);

        // Return the token in the response
        res.header('auth-token', token).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    // Validate the request body
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        // Check if the email exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ message: 'Email or password is incorrect' });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Email or password is incorrect' });

        // Determine user role
        let role = 'unknown';
        if (user.role === 'admin') {
            role = 'admin';
        } else if (user.role === 'mentor') {
            role = 'mentor';
        } else if (user.role === 'mentee') {
            role = 'mentee';
        }

        // Create and sign a JWT token
        const token = jwt.sign({ _id: user._id, role }, process.env.JWT_SECRET);

        // Return the token and role in the response
        res.header('auth-token', token).json({ token, role, email: user.email });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
