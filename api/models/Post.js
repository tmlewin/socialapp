const mongoose = require('mongoose');


const PostSchema = new mongoose.Schema(
    
    {
    userId:{type: 'String', required: true},
    postId: String,
    user:String,
    img:String,
    content:String,
    likes:{
        type: Array,
        default: []
    }
},

    {timestamps: true}

    


)
module.exports = mongoose.model("Post", PostSchema)