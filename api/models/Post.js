const mongoose = require('mongoose');


const PostSchema = new mongoose.Schema(
    
    {
    title: {
        type: String,
        required: true
    },
    content: {
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
    img: String,
    likes: {
        type: Array,
        default: []
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
},

    {timestamps: true}

    


)
module.exports = mongoose.model("Post", PostSchema)