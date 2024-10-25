const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    criteria: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Achievement', AchievementSchema);
