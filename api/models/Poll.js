const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        name: String,
        votes: {
            type: Number,
            default: 0
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Poll', PollSchema);
