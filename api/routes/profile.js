const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Adjust the destination as needed
const fs = require('fs');
const Post = require('../models/Post'); // Assuming Post model is defined elsewhere

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('achievements');
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// Update user profile
router.put('/profile', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.file) {
            const fileName = req.file.filename;
            const filePath = `uploads/${fileName}`;
            user.profilePicture = `${req.protocol}://${req.get('host')}/${filePath}`;
            // Move the uploaded file to the correct location
            fs.renameSync(req.file.path, filePath);
        }

        // Update other fields
        const { displayName, fullName, dateOfBirth, location, bio, website } = req.body;
        user.displayName = displayName || user.displayName;
        user.fullName = fullName || user.fullName;
        user.dateOfBirth = dateOfBirth || user.dateOfBirth;
        user.location = location || user.location;
        user.bio = bio || user.bio;
        user.website = website || user.website;

        await user.save();

        // Update all posts with the new profile picture
        await Post.updateMany({ userId: user._id }, { userProfilePicture: user.profilePicture });

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// Change password
router.put('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body

    try {
        let user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' })
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)

        await user.save()

        res.json({ message: 'Password updated successfully' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router
