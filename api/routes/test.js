const router = require('express').Router()
const bcrypt = require('bcrypt')
const Post = require('../models/Post')
const User = require('../models/User')

// login

router.post('/register', async(req, res) => {
    try{
    const salt = await bcrypt.genSalt(19)
    const hashedPassword = await bcrypt.hash(req.body.password,salt)
    const newuser  = new User({
        username:req.body.username,
        password:hashedPassword,
    })
    newuser.save().then((user) => {
        res.status(200).send(user)
    })
}
catch(err) {
    res.status(500).send(err)
}


    
})

router.post('/login', async(req, res) => {
    try{
    const user = await User.findOne({username: req.body.username})
    !user && res.status(500).send("username not found")

    
    const validPassword = await bcrypt.compare(user.password, req.body.password)
    !validPassword && res.status(500).send("invalid password")
    res.status(200).send(user)
    }
    catch(err) {
        res.status(500).send(err)
    }




})

// get all data

router.get('/', (req, res)=>{
      Post.find().then((data)=>{
        res.status(200).send(data)

    })
})

//create new post

router.get('/',async(req, res)=>{
    try{
    const newpost = await new Post(req.body)
    newpost.save().then((saved)=>{
        res.status(200).send(saved)
    })
}
catch(err) {
    res.status(500).send(err)
}
})

//edit postId


router.put('/:id', async(req, res)=>{
    const post = await Post.findOne({'postId':req.params.id})
    if(post.userId == req.body.userId){
       await  post.updateOne({$set: req.body.userId})
        res.status(200).send(req.body)
    }else{
        res.status(500).send('You can onloy edit your own post')
    }

})


// delete data

router.post('/delete',async(req, res)=>{
    try{
    const post = await Post.findOne({'postId':req.body.id})
    await post.deleteOne()
    res.status(200).send("post deleted successfully")
    }
    catch(err) {
        res.status(500).send(err)
    }

})

//likes



router.put('/:id/likes', async(req, res)=>{
    try{
    const post = await Post.findOne({'postId':req.params.id})
    if(!post.likes.includes(req.body.userId)){
        await post.updateOne({$push:{likes:req.body.userId}})
        res.status(200).send('post has been liked')
    }else{
        await post.updateOne({$pull:{likes:req.body.userId}})
        res.status(200).send('post has been unliked')

    }
}
catch(err) {
    res.status(500).send(err)
}

})
