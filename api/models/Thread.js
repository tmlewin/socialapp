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
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Thread", ThreadSchema);
