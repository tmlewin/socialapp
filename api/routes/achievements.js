const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');
const achievementDefinitions = require('../achievementDefinitions');

// Add this route at the beginning of the file
router.get('/all', async (req, res) => {
    try {
        const achievements = await Achievement.find();
        console.log('All achievements from database:', achievements);
        res.json(achievements);
    } catch (error) {
        console.error('Error fetching all achievements:', error);
        res.status(500).json({ message: 'Error fetching all achievements', error: error.message });
    }
});

// Get all achievements for the current user
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('achievements');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User achievements:', user.achievements); // Debug log
        res.json(user.achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ message: 'Error fetching achievements', error: error.message });
    }
});

const getUserStats = async (userId) => {
    const [postCount, commentCount, pollCount, voteCount] = await Promise.all([
        Post.countDocuments({ userId }),
        Comment.countDocuments({ userId }),
        Poll.countDocuments({ createdBy: userId }),
        Poll.countDocuments({ voters: userId }),
    ]);

    return { postCount, commentCount, pollCount, voteCount };
};

const checkAndAwardAchievements = async (userId) => {
    try {
        const user = await User.findById(userId);
        console.log('Checking achievements for user:', user.username);

        const userStats = await getUserStats(userId);
        console.log(`User ${userId} total stats:`, userStats);

        const allAchievements = await Achievement.find();
        let achievementsAwarded = false;

        for (const achievement of allAchievements) {
            if (!user.achievements.includes(achievement._id)) {
                const achievementDef = achievementDefinitions.find(def => def.name === achievement.name);
                if (achievementDef && achievementDef.criteria(userStats)) {
                    user.achievements.push(achievement._id);
                    achievementsAwarded = true;
                    console.log(`Awarded "${achievement.name}" to user ${user._id}`);
                }
            }
        }

        if (achievementsAwarded) {
            const savedUser = await user.save();
            console.log(`Saved updated achievements for user ${user._id}:`, savedUser.achievements);
        } else {
            console.log(`No new achievements awarded to user ${user._id}`);
        }

        return user.achievements;
    } catch (error) {
        console.error('Error checking and awarding achievements:', error);
        return [];
    }
};

// Add a new route to manually trigger achievement checks for a user
router.post('/check', auth, async (req, res) => {
    try {
        const updatedAchievements = await checkAndAwardAchievements(req.user.id);
        res.json(updatedAchievements);
    } catch (error) {
        console.error('Error checking achievements:', error);
        res.status(500).json({ message: 'Error checking achievements', error: error.message });
    }
});

// Add this route to manually check achievements for a specific user
router.get('/check/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const updatedAchievements = await checkAndAwardAchievements(userId);
        res.json(updatedAchievements);
    } catch (error) {
        console.error('Error checking achievements:', error);
        res.status(500).json({ message: 'Error checking achievements', error: error.message });
    }
});

module.exports = { router, checkAndAwardAchievements };
