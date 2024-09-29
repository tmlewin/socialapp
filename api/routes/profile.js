const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
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
router.put('/profile', auth, async (req, res) => {
    const {
        displayName,
        fullName,
        dateOfBirth,
        location,
        bio,
        website
    } = req.body

    try {
        let user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        user.displayName = displayName || user.displayName
        user.fullName = fullName || user.fullName
        user.dateOfBirth = dateOfBirth || user.dateOfBirth
        user.location = location || user.location
        user.bio = bio || user.bio
        user.website = website || user.website

        await user.save()

        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
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