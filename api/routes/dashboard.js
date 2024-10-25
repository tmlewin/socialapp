const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Thread = require('../models/Thread');
const auth = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalLikes = await Post.aggregate([
            { $group: { _id: null, totalLikes: { $sum: { $size: "$likes" } } } }
        ]);
        const activeUsers = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } });

        res.json({
            totalUsers,
            totalPosts,
            totalLikes: totalLikes[0]?.totalLikes || 0,
            activeUsers
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
});

// Get weekly activity data
router.get('/activity', auth, async (req, res) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000);
        const activityData = await Post.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                posts: { $sum: 1 },
                comments: { $sum: { $size: "$comments" } },
                likes: { $sum: { $size: "$likes" } }
            }},
            { $sort: { _id: 1 } }
        ]);

        const formattedData = activityData.map(day => ({
            name: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
            posts: day.posts,
            comments: day.comments,
            likes: day.likes
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching activity data:', error);
        res.status(500).json({ message: 'Error fetching activity data', error: error.message });
    }
});

// Add this new route
router.get('/top-posts', auth, async (req, res) => {
    try {
        const topPosts = await Post.aggregate([
            { $project: {
                title: 1,
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" }
            }},
            { $sort: { likesCount: -1, commentsCount: -1 } },
            { $limit: 5 }
        ]);

        res.json(topPosts);
    } catch (error) {
        console.error('Error fetching top posts:', error);
        res.status(500).json({ message: 'Error fetching top posts', error: error.message });
    }
});

module.exports = router;
