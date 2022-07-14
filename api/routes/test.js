const router = require('express').Router()
const User = require('../models/User')
const Post = require('../models/Post')
const bcrypt = require('bcrypt')
const { post } = require('./posts')



/***    AUTH ROUTES */
// create the register routes 

router.post('/register',async(req, res)=>{
    try{
    // define hash strenght for password
    const salt = await bcrypt.genSalt(25)
    const hashedpassword = await bcrypt.hash(req.body.password, salt)

    const newUser = new User({
        username: req.body.username,
        password: hashedpassword
    })
    newUser.save().then((userdata)=>{
        res.status(200).send(userdata)
    })
}
catch(err){
    res.status(500).send(err)
}
})


// create the login route

router.get('/login',async(req, res)=>{
    
try{
    const user = await User.findOne({username: req.body.username})
    !user && res.status(404).send("username not found")
    res.status(200).send(user)

    const validPassword = bcrypt.compare(req.body.password, user.password)
    !validPassword && res.status(404).send("Invalid password")

}
catch(err) {
    res.status(500).send(err)
}

})

//Router to get all post

router.get('/', async(req, res)=>{
    Post.find().then((data)=>{
        res.status(200).send(data)
    })
})


// Router for creating a new post

router.get('/',async(req, res)=>{
    try{
    const newPost =  new Post(req.body)
    newPost.save().then((data)=>{
        res.status(200).send(data)
    })
}
catch(err){
    res.status(500).send(err)
}
})


// edit an existing post

router.put('/:id', async(req, res)=>{
    try{
    const post = await Post.findOne({'postId':req.params.id})
    if(post.userId === req.body.userId){
        post.updateOne({$set: req.body})
        res.status(200).send(req.body)

    }else{
        res.status(500).send("You cant edit the post of a different user")
    }
}

catch(err){
    res.status(500).send(err)
}
})

// router for deleting a post be

router.post('/delete', async(req, res)=>{
    try{
    const post = await Post.findOne({'postId':req.body.id})
    post.deleteOne()
    res.status(200).send("The post was successfully deleted")


    }
    catch(err) {

        res.status(500).send(err)
    }
})


// Router to get a post by id

router.get('/:id', async(req, res)=>{
    const post = await Post.findOne({'postId':req.params.id})
    res.status(200).send(post)
})


// router to like and unlike post

router.get('/:id/likes', async(req, res)=>{
    try{
    const post = await Post.findOne({'postId':req.params.id})
    if(!post.likes.includes(req.body.userId)){
        await  post.updateOne({$push:{likes: req.body.userId}})
        res.status(200).send("Post has been liked")
    }else{
       await  post.updateOne({$pull:{likes: req.body.userId}})
        res.status(200).send("Post has been liked")
    }
}
catch(err) {
    res.status(500).send(err)
}
})



//edit [post]


router.get('/:id', async(req, res)=>{
    const post = await Post.findOne({'postId':req.params.id})
    if(post.userId == req.body.userId){
       await  post.updateOne({$set: req.body})
       res.status(200).send(req.body)

    }else{
        rea.status(500).send("You cant edit another person's post")
    }

})




// delete post

router.post('/delete', async (req, res)=>{
    const post = await Post.findOne({'postId':req.body.id})
    await post.deleteOne()
    res.status(200).send('posts sucessfully deleted')
})


router.post('/:id/likes', async(req, res)=>{
    const post = await Post.findOne({'postId':req.params.id})

    if(!post.likes.includes(req.body.userId)){
        await post.updateOne({$push:{likes: req.body.userId}})
        res.status(200).send("Post has been liked")
    }else{
        await post.updateOne({$pull:{likes: req.body.userId}})
        res.status(200).send("Post has been unliked")
    }
   

})

//get post by idx

router.get('/',async (req, res)=>{

    const post = await Post.findOne({'postId':req.params.id})
    res.status(200).send(post)

})