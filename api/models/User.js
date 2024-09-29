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
           default:"https://cdn.vox-cdn.com/thumbor/JgCPp2BBxETY596wCp50ccosCfE=/0x0:2370x1574/1200x800/filters:focal(996x598:1374x976)/cdn.vox-cdn.com/uploads/chorus_image/image/68870438/Screen_Shot_2020_07_21_at_9.38.25_AM.0.png"
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
        }
    },
    {timestamps: true}



)

module.exports = mongoose.model("User",UserSchema)