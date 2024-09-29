const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Thread = require('../models/Thread');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
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
router.post('/', auth, async (req, res) => {
    const { title, content, threadId } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newPost = new Post({
            title,
            content,
            threadId,
            userId,
            user: user.username,
        });

        const savedPost = await newPost.save();
        
        // Increment the post count for the thread
        await Thread.findByIdAndUpdate(threadId, { $inc: { postCount: 1 } });

        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ message: 'Error creating post', error: err.message });
    }
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
        const post = await Post.findById(req.params.id).populate('comments');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post.comments);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching comments', error: err.message });
    }
});

// Add a comment to a post
router.post('/:id/comments', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const newComment = new Comment({
            content: req.body.content,
            postId: post._id,
            userId: req.body.userId,
            username: req.body.username
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
        if (comment.userId.toString() === req.body.userId) {
            const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId,
                { $set: { content: req.body.content } },
                { new: true }
            );
            res.status(200).json(updatedComment);
        } else {
            res.status(403).json("You can update only your comment");
        }
    } catch (err) {
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