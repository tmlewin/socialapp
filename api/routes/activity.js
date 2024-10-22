const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');
const striptags = require('striptags');

// Helper function to truncate and sanitize text
const formatContent = (content, maxLength = 50) => {
    const sanitized = striptags(content); // Remove HTML tags
    if (sanitized.length <= maxLength) return sanitized;
    return sanitized.substring(0, maxLength) + '...';
};

router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching activity for user:', userId);

        // Fetch recent posts
        const posts = await Post.find({ userId }).sort({ createdAt: -1 }).limit(5);
        console.log('Fetched posts:', posts.length);
        
        // Fetch recent comments
        const comments = await Comment.find({ userId }).sort({ createdAt: -1 }).limit(5);
        console.log('Fetched comments:', comments.length);
        
        // Fetch recent polls
        const polls = await Poll.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(5);
        console.log('Fetched polls:', polls.length);
        
        // Fetch recent votes
        const votes = await Poll.find({ voters: userId }).sort({ createdAt: -1 }).limit(5);
        console.log('Fetched votes:', votes.length);

        // Combine and sort all activities
        const activities = [
            ...posts.map(post => ({ type: 'post', content: formatContent(post.content), date: post.createdAt })),
            ...comments.map(comment => ({ type: 'comment', content: formatContent(comment.content), date: comment.createdAt })),
            ...polls.map(poll => ({ type: 'poll', content: formatContent(poll.question), date: poll.createdAt })),
            ...votes.map(vote => ({ type: 'vote', content: formatContent(vote.question), date: vote.createdAt }))
        ].sort((a, b) => b.date - a.date).slice(0, 20);

        console.log('Total activities:', activities.length);
        res.json(activities);
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ message: 'Error fetching user activity', error: error.message });
    }
});

module.exports = router;
