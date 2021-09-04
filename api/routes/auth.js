const router = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/User')



router.post('/register',async(req,res) => {
    try{
        const salt = await bcrypt.genSalt(10)
        const hashedPassword =  await bcrypt.hash(req.body.password, salt)
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword
        })

        newUser.save().then((user) => {
            res.status(200).send(user)
        })





    }
    catch(err){
        res.status(500).send(err)
    }
})


router.post('/login',async(req,res) => {
    try{
        const user = await User.findOne({username: req.body.username})
        !user && res.status(404).send("User not found")

        const validPassword = await bcrypt.compare(req.body.password,user.password)
        !validPassword && res.status(404).send("password incorrect")

        res.status(200).send(user)

    }
    catch(err) {
        res.status(500).send(err)
    }

})
module.exports = router




