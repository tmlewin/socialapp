const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        userProfilePicture: {
            type: String,
            default: "https://via.placeholder.com/40"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);