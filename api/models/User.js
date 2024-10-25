const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    
    {
        username:{
            type:String,
            unique:true,
            required:true,
            min:8,
            max: 20
        },
        email:{
            type:String,
            unique:true,
            required:true
        },
        password:{
            
            type:String,
            required:true,
            min:6
        },
       
        displayName:{
            type:String,
            default:function() { return this.username; }
        },
        profilePicture:{
            type: String,
            default: "https://via.placeholder.com/40"
        },
        fullName:String,
        dateOfBirth:Date,
        location:String,
        bio:String,
        website:String,
        socialMediaLinks:{
            twitter:String,
            facebook:String,
            instagram:String,
            linkedin:String
        },
        achievements: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Achievement'
        }],
        unreadMessageCount: {
            type: Number,
            default: 0
        }
    },
    {timestamps: true}



)

module.exports = mongoose.model("User",UserSchema)
