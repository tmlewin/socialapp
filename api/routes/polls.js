const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');
const { checkAndAwardAchievements } = require('./achievements');

// Get all polls (with pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const polls = await Poll.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Poll.countDocuments();

        res.json({
            polls,
            hasMore: total > skip + polls.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new poll
router.post('/', auth, async (req, res) => {
    const poll = new Poll({
        question: req.body.question,
        options: req.body.options.map(option => ({ name: option, votes: 0 })),
        createdBy: req.user.id,
        expiresAt: new Date(req.body.expiresAt)
    });

    try {
        const newPoll = await poll.save();
        
        // Check and award achievements
        await checkAndAwardAchievements(req.user.id);

        res.status(201).json(newPoll);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Vote on a poll
router.put('/:id/vote', auth, async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        // Check if poll has expired
        if (new Date() > new Date(poll.expiresAt)) {
            return res.status(400).json({ message: 'This poll has expired' });
        }

        // Check if user has already voted
        if (poll.voters.includes(req.user.id)) {
            return res.status(400).json({ message: 'You have already voted on this poll' });
        }

        const optionIndex = poll.options.findIndex(option => option._id.toString() === req.body.optionId);
        if (optionIndex === -1) return res.status(400).json({ message: 'Option not found' });

        poll.options[optionIndex].votes += 1;
        poll.voters.push(req.user.id);
        await poll.save();

        // Check and award achievements
        await checkAndAwardAchievements(req.user.id);

        res.json(poll);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Edit a poll
router.put('/:id', auth, async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (poll.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this poll' });
        }

        poll.question = req.body.question;
        poll.options = req.body.options;
        poll.expiresAt = new Date(req.body.expiresAt);

        const updatedPoll = await poll.save();
        res.json(updatedPoll);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a poll
router.delete('/:id', auth, async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (poll.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this poll' });
        }

        await Poll.findByIdAndDelete(req.params.id); // Change this line
        res.json({ message: 'Poll deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single poll
router.get('/:id', async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        res.json(poll);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
