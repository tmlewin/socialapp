const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user's latest profile picture
router.get('/:userId/profile-picture', async (req, res) => {
    console.log('Received request for profile picture. userId:', req.params.userId);
    try {
        if (!req.params.userId) {
            return res.status(400).json({ message: 'Invalid userId provided' });
        }
        const user = await User.findById(req.params.userId);
        if (!user) {
            console.log('User not found for userId:', req.params.userId);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('Sending profile picture for user:', user.username);
        res.json({ profilePicture: user.profilePicture });
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).json({ message: 'Error fetching profile picture', error: error.message });
    }
});

// Get user data
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
});

module.exports = router;