const router = require('express').Router()
const Post = require('../models/Post')
const User = require('../models/User')


// get all data
router.get('/',async  (req, res)=>{
    Post.find().then(data=>res.send(data))
})


// create data for userposts/save
router.get('/',  (req, res)=>{
    const newPost = new Post(req.body)
    try{
        newPost.save().then(saved=>{
            res.status(200).send(saved)
        })


    }
    catch(err) {
        res.status(500).send(err)
    }

})

//edit data for user  posts

router.put('/:id', async(req, res)=>{
    const post = await Post.findOne({'postId':req.params.id})
    if(post.userId == req.body.userId){
        await post.updateOne({$set: req.body})
        res.status(200).send(req.body)
    }
    else{
        res.status(400).send("You can only edit your own posts")
    }


})


// delete a post
router.post('/delete', async(req,res)=>{
    try{
    const post = await Post.findOne({'postId':req.body.id})
    await post.deleteOne()
    res.status(200).send("The post is deleted")
    }
    catch(err){
        res.status(500).send(err)
    }


})

// sending a post id

router.get('/:id',async(req, res)=>{
    const post = await Post.findOne({'postId':req.params.id})
    res.status(200).send(post)
})


// like and unlike post
router.put('/:id/like',async(req, res)=>{
    try{
        const post = await Post.findOne({'postId':req.params.id})
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{likes: req.body.userId}})
            res.status(200).send("post was liked ")

        }
        else{
            await post.updateOne({$pull:{likes: req.body.userId}})
            res.status(200).send("post was unliked ")

        }


    }
    catch(err) {
        res.status(500).send(err)
    }

})

module.exports = router

