import React, { useState, useEffect, useCallback } from 'react';
import './css/Post.css';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Edit, Trash2 } from 'lucide-react';
import axios from '../axios';

export default function Post({ post, onPostUpdate, onPostDelete }) {
    const [localPost, setLocalPost] = useState(post);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showPostOptions, setShowPostOptions] = useState(false);
    const [editingPost, setEditingPost] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [commentOptionsId, setCommentOptionsId] = useState(null);
    const defaultAvatar = "https://via.placeholder.com/40";

    useEffect(() => {
        setLocalPost(post);
        fetchComments();
    }, [post]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (commentOptionsId && !event.target.closest('.comment-options')) {
                setCommentOptionsId(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [commentOptionsId]);

    const fetchComments = useCallback(async () => {
        try {
            const response = await axios.get(`/api/posts/${localPost._id}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }, [localPost._id]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.post(`/api/posts/${localPost._id}/comments`, {
                content: newComment,
                userId: user._id,
                username: user.username
            });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleEditPost = () => {
        setEditingPost(true);
        setEditedContent(localPost.content);
        setShowPostOptions(false);
    };

    const handleUpdatePost = async () => {
        try {
            const response = await axios.put(`/api/posts/${localPost._id}`, {
                content: editedContent,
                userId: localPost.userId // Ensure this is the correct user ID
            });
            setLocalPost(response.data);
            setEditingPost(false);
            onPostUpdate(response.data);
        } catch (error) {
            console.error('Error updating post:', error);
            if (error.response && error.response.status === 403) {
                alert('You do not have permission to edit this post.');
            } else {
                alert('An error occurred while updating the post. Please try again.');
            }
        }
    };

    const handleDeletePost = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.delete(`/api/posts/${localPost._id}`, {
                data: { userId: user._id }
            });
            if (typeof onPostDelete === 'function') {
                onPostDelete(localPost._id);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment._id);
        setEditedContent(comment.content);
        setCommentOptionsId(null);
    };

    const handleUpdateComment = async (commentId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.put(`/api/posts/${localPost._id}/comments/${commentId}`, {
                content: editedContent,
                userId: user._id
            });
            setComments(comments.map(c => c._id === commentId ? response.data : c));
            setEditingComment(null);
            setEditedContent('');
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.delete(`/api/posts/${localPost._id}/comments/${commentId}`, {
                data: { userId: user._id }
            });
            setComments(comments.filter(c => c._id !== commentId));
            setCommentOptionsId(null);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="post">
            <div className="post-header">
                <img 
                    src={localPost.userProfilePicture || defaultAvatar} 
                    alt={localPost.user} 
                    className="avatar" 
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                />
                <div className="post-info">
                    <h3>{localPost.user}</h3>
                    <span>{new Date(localPost.createdAt).toLocaleString()}</span>
                </div>
                {post.threadTitle && <h4 className="thread-title">{post.threadTitle}</h4>}
                <div className="post-options">
                    <MoreHorizontal size={20} className="more-options" onClick={() => setShowPostOptions(!showPostOptions)} />
                    {showPostOptions && (
                        <div className="options-dropdown">
                            <button onClick={handleEditPost}><Edit size={16} /> Edit</button>
                            <button onClick={handleDeletePost}><Trash2 size={16} /> Delete</button>
                        </div>
                    )}
                </div>
            </div>
            <div className="post-content">
                {localPost.title && <h4>{localPost.title}</h4>}
                {editingPost ? (
                    <div>
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                        />
                        <button onClick={handleUpdatePost}>Save</button>
                        <button onClick={() => {
                            setEditingPost(false);
                            setEditedContent('');
                        }}>Cancel</button>
                    </div>
                ) : (
                    <p>{localPost.content}</p>
                )}
            </div>
            <div className="post-actions">
                <button><Heart size={20} /> {localPost.likes.length}</button>
                <button><MessageCircle size={20} /> {comments.length}</button>
                <button><Share2 size={20} /></button>
            </div>
            <div className="post-comments">
                {comments.map((comment) => (
                    <div key={comment._id} className="comment">
                        <img 
                            src={comment.userProfilePicture || defaultAvatar} 
                            alt={comment.username} 
                            className="avatar-small" 
                            onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                        />
                        <div className="comment-content">
                            <strong>{comment.username}</strong>
                            {editingComment === comment._id ? (
                                <div>
                                    <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                    />
                                    <button onClick={() => handleUpdateComment(comment._id)}>Save</button>
                                    <button onClick={() => {
                                        setEditingComment(null);
                                        setEditedContent('');
                                    }}>Cancel</button>
                                </div>
                            ) : (
                                <p>{comment.content}</p>
                            )}
                        </div>
                        <div className="comment-options">
                            <MoreHorizontal size={16} onClick={() => setCommentOptionsId(comment._id)} />
                            {commentOptionsId === comment._id && (
                                <div className="options-dropdown">
                                    <button onClick={() => handleEditComment(comment)}><Edit size={14} /> Edit</button>
                                    <button onClick={() => handleDeleteComment(comment._id)}><Trash2 size={14} /> Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="post-comment-input">
                <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment();
                        }
                    }}
                />
                <button onClick={handleAddComment}><Send size={20} /></button>
            </div>
        </div>
    );
}