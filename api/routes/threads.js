const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all threads
router.get('/', async (req, res) => {
    try {
        const threads = await Thread.find()
            .populate('userId', 'profilePicture') // Add this line to populate user data
            .sort({ createdAt: -1 });

        // Map through threads to ensure userProfilePicture is set
        const threadsWithProfiles = threads.map(thread => ({
            ...thread._doc,
            userProfilePicture: thread.userId?.profilePicture || thread.userProfilePicture || "https://via.placeholder.com/40"
        }));

        res.status(200).json(threadsWithProfiles);
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
            userProfilePicture: user.profilePicture || "https://via.placeholder.com/40" // Ensure default is set
        });

        const savedThread = await newThread.save();
        
        // Return the thread with all necessary user information
        const threadWithProfile = {
            ...savedThread._doc,
            userProfilePicture: user.profilePicture || "https://via.placeholder.com/40"
        };

        res.status(201).json(threadWithProfile);
    } catch (err) {
        console.error('Error creating thread:', err);
        res.status(500).json({ message: 'Error creating thread', error: err.message });
    }
});

// Get a specific thread
router.get('/:id', auth, async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        // Mark thread as read without updating lastActivity
        const readEntry = thread.readBy.find(read => 
            read.userId.toString() === req.user.id
        );
        
        if (!readEntry) {
            // Use findByIdAndUpdate to avoid triggering the pre-save hook
            await Thread.findByIdAndUpdate(thread._id, {
                $push: {
                    readBy: {
                        userId: req.user.id,
                        readAt: new Date()
                    }
                }
            }, { new: true });
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
