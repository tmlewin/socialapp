const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Create a new post
router.post('/', async (req, res) => {
    try {
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Update a post
router.put('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.userId.toString() === req.body.userId) {
            await post.updateOne({ $set: req.body });
            const updatedPost = await Post.findById(req.params.id);
            res.status(200).json(updatedPost);
        } else {
            res.status(403).json({ message: "You can only edit your own posts" });
        }
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Delete a post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.userId.toString() === req.body.userId) {
            await post.deleteOne();
            res.status(200).json({ message: "The post has been deleted" });
        } else {
            res.status(403).json({ message: "You can only delete your own posts" });
        }
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Add a comment to a post
router.post('/:id/comments', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const newComment = new Comment({
            content: req.body.content,
            userId: req.body.userId,
            postId: post._id,
            username: req.body.username
        });
        const savedComment = await newComment.save();
        post.comments.push(savedComment._id);
        await post.save();
        res.status(201).json(savedComment);
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Get all comments for a post
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: 'asc' });
        res.status(200).json(comments);
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Update a comment
router.put('/:id/comments/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.userId.toString() === req.body.userId) {
            await comment.updateOne({ $set: { content: req.body.content } });
            const updatedComment = await Comment.findById(req.params.commentId);
            res.status(200).json(updatedComment);
        } else {
            res.status(403).json({ message: "You can only edit your own comments" });
        }
    } catch (err) {
        console.error("Error updating comment:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Delete a comment
router.delete('/:id/comments/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.userId.toString() === req.body.userId) {
            await comment.deleteOne();
            // Remove the comment reference from the post
            await Post.findByIdAndUpdate(req.params.id, { $pull: { comments: req.params.commentId } });
            res.status(200).json({ message: "The comment has been deleted" });
        } else {
            res.status(403).json({ message: "You can only delete your own comments" });
        }
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;

