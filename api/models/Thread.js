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
        postCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Thread", ThreadSchema);