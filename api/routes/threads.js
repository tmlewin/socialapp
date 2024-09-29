const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all threads
router.get('/', async (req, res) => {
    try {
        const threads = await Thread.find().sort({ createdAt: -1 });
        res.status(200).json(threads);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching threads', error: err.message });
    }
});

// Create a new thread
router.post('/', auth, async (req, res) => {
    const { title } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newThread = new Thread({
            title,
            userId,
            user: user.username,
        });

        const savedThread = await newThread.save();
        res.status(201).json(savedThread);
    } catch (err) {
        console.error('Error creating thread:', err);
        res.status(500).json({ message: 'Error creating thread', error: err.message });
    }
});

// Get a specific thread
router.get('/:id', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        res.status(200).json(thread);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching thread', error: err.message });
    }
});

// Get posts for a specific thread
router.get('/:id/posts', async (req, res) => {
    try {
        const posts = await Post.find({ threadId: req.params.id }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching posts for thread', error: err.message });
    }
});

module.exports = router;