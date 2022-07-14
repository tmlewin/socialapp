const router = require('express').Router()
const Post = require('../models/Post')
const User = require('../models/User')



router.put('/:id/likes', async (req, res) => {
    const post = await Post.findOne({ 'postId': req.params.id })
    if(!post.likes.includes(req.body.userId)){
        await post.updateOne({ $push: { likes: req.body.userId } })
        res.status(200).send('post sucessfully liked')
    }else{
        await post.updateOne({ $pull: { likes: req.body.userId } })
        res.status(200).send('post sucessfully unliked')
    }

    
})