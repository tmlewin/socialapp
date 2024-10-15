const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Thread = require('../models/Thread');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
       
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports images"));
    }
}).array('images', 5); // Change this line to use 'images' and allow up to 5 images

// Get all posts (with pagination)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username profilePicture');

        const totalPosts = await Post.countDocuments();

        const updatedPosts = posts.map(post => ({
            ...post._doc,
            userId: post.userId._id,
            userProfilePicture: post.userId.profilePicture
        }));

        res.status(200).json({
            posts: updatedPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            hasMore: page * limit < totalPosts
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Search posts
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const posts = await Post.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error searching posts', error: error.message });
    }
});

// Create a new post
router.post('/', auth, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const user = await User.findById(req.user.id);
            const newPost = new Post({
                threadId: req.body.threadId,
                title: req.body.title,
                content: req.body.content,
                userId: user._id,
                user: user.username,
                userProfilePicture: user.profilePicture,
                images: req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [] // Replace backslashes with forward slashes
            });

            const savedPost = await newPost.save();

            // Increment the post count for the thread
            await Thread.findByIdAndUpdate(req.body.threadId, { $inc: { postCount: 1 } });

            // Send the full post data including images
            res.status(200).json(savedPost);
        } catch (err) {
            console.error('Error creating post:', err);
            res.status(500).json({ message: 'Error creating post', error: err.message });
        }
    });
});

// Update a post
router.put('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user is the owner of the post
        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to edit this post' });
        }

        post.content = req.body.content;
        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId.toString() === req.body.userId) {
            await Post.findByIdAndDelete(req.params.id);
            // Decrement the post count for the thread
            await Thread.findByIdAndUpdate(post.threadId, { $inc: { postCount: -1 } });
            // Also delete all comments associated with this post
            await Comment.deleteMany({ postId: req.params.id });
            res.status(200).json({ message: "The post has been deleted" });
        } else {
            res.status(403).json({ message: "You can delete only your post" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error deleting post", error: err.message });
    }
});

// like / dislike a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get comments for a specific post
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id })
            .populate('userId', 'username profilePicture')
            .sort({ createdAt: 1 });
        const updatedComments = comments.map(comment => ({
            ...comment._doc,
            userProfilePicture: comment.userId.profilePicture
        }));
        res.status(200).json(updatedComments);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const user = await User.findById(req.user.id);
        const newComment = new Comment({
            content: req.body.content,
            postId: post._id,
            userId: req.user.id,
            username: user.username,
            userProfilePicture: user.profilePicture
        });
        const savedComment = await newComment.save();
        post.comments.push(savedComment._id);
        await post.save();
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ message: 'Error adding comment', error: err.message });
    }
});

// Update a comment
router.put('/:postId/comments/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId.toString() !== req.body.userId) {
            return res.status(403).json({ message: "You can update only your comment" });
        }

        comment.content = req.body.content;
        const updatedComment = await comment.save();

        // Fetch the user data to get the latest profile picture
        const user = await User.findById(comment.userId);
        
        const commentToSend = {
            ...updatedComment.toObject(),
            userProfilePicture: user.profilePicture,
            username: user.username
        };

        res.status(200).json(commentToSend);
    } catch (err) {
        console.error('Error updating comment:', err);
        res.status(500).json({ message: 'Error updating comment', error: err.message });
    }
});

// Delete a comment
router.delete('/:postId/comments/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.userId.toString() === req.body.userId) {
            await Comment.findByIdAndDelete(req.params.commentId);
            // Remove the comment reference from the post
            await Post.findByIdAndUpdate(req.params.postId, {
                $pull: { comments: req.params.commentId }
            });
            res.status(200).json({ message: "The comment has been deleted" });
        } else {
            res.status(403).json({ message: "You can delete only your comment" });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error deleting comment', error: err.message });
    }
});

module.exports = router;
