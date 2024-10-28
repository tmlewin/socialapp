const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        user: {
            type: String,
            required: true
        },
        userProfilePicture: {
            type: String,
            default: "https://via.placeholder.com/40"
        },
        postCount: {
            type: Number,
            default: 0
        },
        viewCount: {
            type: Number,
            default: 0
        },
        isLocked: {
            type: Boolean,
            default: false
        },
        isPinned: {
            type: Boolean,
            default: false
        },
        lastActivity: {
            type: Date,
            default: function() {
                return this.createdAt || new Date();
            }
        },
        isSolved: {
            type: Boolean,
            default: false
        },
        readBy: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            readAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    { timestamps: true }
);

// Add this method to update lastActivity explicitly
ThreadSchema.methods.updateLastActivity = function() {
    this.lastActivity = new Date();
    return this.save();
};

module.exports = mongoose.model("Thread", ThreadSchema);
