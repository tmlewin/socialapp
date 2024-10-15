import React, { useState, useEffect, useCallback, useRef } from 'react';
import DOMPurify from 'dompurify';
import './css/Post.css';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Edit, Trash2, Copy } from 'lucide-react';
import axios from '../axios';
import { Link } from 'react-router-dom';
import config from '../config'; // We'll create this file

export default function Post({ post, onPostUpdate, onPostDelete }) {
    console.log('Post object:', post); // Add this line for debugging
    console.log('UserId:', post.userId); // Add this line for debugging

    const [localPost, setLocalPost] = useState(post);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showPostOptions, setShowPostOptions] = useState(false);
    const [editingPost, setEditingPost] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [commentOptionsId, setCommentOptionsId] = useState(null);
    const defaultAvatar = "https://via.placeholder.com/40";

    const [userProfilePicture, setUserProfilePicture] = useState(post.userProfilePicture || defaultAvatar);
    const [isLiked, setIsLiked] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    // Add these new refs
    const postOptionsRef = useRef(null);
    const commentOptionsRef = useRef(null);

    useEffect(() => {
        setLocalPost(post);
        fetchComments();
        // Check if the current user has liked the post
        const currentUser = JSON.parse(localStorage.getItem('user'));
        setIsLiked(post.likes.includes(currentUser._id));
    }, [post]);

    useEffect(() => {
        const fetchLatestProfilePicture = async () => {
            if (!post.userId) {
                console.error('No userId provided for post:', post);
                return;
            }
            try {
                const response = await axios.get(`/api/users/${post.userId}`);
                if (response.data && response.data.profilePicture) {
                    setUserProfilePicture(response.data.profilePicture);
                }
            } catch (error) {
                console.error('Error fetching latest profile picture:', error.response || error);
            }
        };

        fetchLatestProfilePicture();
    }, [post.userId]);

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
            const updatedComments = await axios.get(`/api/posts/${localPost._id}/comments`);
            setComments(updatedComments.data);
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
        console.log('Attempting to update post:', localPost._id); // Add this line
        try {
            const response = await axios.put(`/api/posts/${localPost._id}`, {
                content: editedContent,
                userId: localPost.userId
            });
            setLocalPost(response.data);
            setEditingPost(false);
            console.log('Post updated successfully:', response.data); // Add this line
            if (typeof onPostUpdate === 'function') {
                onPostUpdate(response.data);
            } else {
                console.warn('onPostUpdate is not a function:', onPostUpdate);
            }
        } catch (error) {
            console.error('Error updating post:', error);
            if (error.response && error.response.status === 403) {
                alert('You do not have permission to edit this post.');
            } else {
                console.error('An error occurred while updating the post:', error);
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
            
            // Check if the response contains the updated comment data
            if (response.data && response.data._id) {
                const updatedComment = response.data;
                setComments(comments.map(c => c._id === commentId ? updatedComment : c));
                setEditingComment(null);
                setEditedContent('');
            } else {
                console.error('Unexpected response format:', response.data);
            }
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

    const handleLike = async () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const response = await axios.put(`/api/posts/${localPost._id}/like`, {
                userId: currentUser._id
            });

            // Update local state
            const updatedLikes = isLiked
                ? localPost.likes.filter(id => id !== currentUser._id)
                : [...localPost.likes, currentUser._id];

            setLocalPost(prev => ({
                ...prev,
                likes: updatedLikes
            }));
            setIsLiked(!isLiked);

            // Call onPostUpdate if it exists
            if (typeof onPostUpdate === 'function') {
                onPostUpdate({
                    ...localPost,
                    likes: updatedLikes
                });
            }
        } catch (error) {
            console.error('Error liking/unliking post:', error);
        }
    };

    const handleShareClick = () => {
        setShowSharePopup(true);
    };

    const copyToClipboard = () => {
        const postLink = `${window.location.origin}/thread/${localPost.threadId}`;
        navigator.clipboard.writeText(postLink)
            .then(() => {
                setCopySuccess('Link copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    // Add this new useEffect hook
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (postOptionsRef.current && !postOptionsRef.current.contains(event.target)) {
                setShowPostOptions(false);
            }
            if (commentOptionsRef.current && !commentOptionsRef.current.contains(event.target)) {
                setCommentOptionsId(null);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const renderContent = () => {
        const sanitizedContent = DOMPurify.sanitize(localPost.content);
        return { __html: sanitizedContent };
    };

    const ContentRenderer = ({ content }) => {
        const containerRef = useRef(null);

        useEffect(() => {
            if (containerRef.current) {
                containerRef.current.innerHTML = content.__html;
            }
        }, [content]);

        return <div ref={containerRef} />;
    };

    return (
        <div className="post">
            <div className="post-header">
                <img 
                    src={userProfilePicture || defaultAvatar} 
                    alt={localPost.user} 
                    className="avatar" 
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                />
                <div className="post-info">
                    <h3>{localPost.user}</h3>
                    <span>{new Date(localPost.createdAt).toLocaleString()}</span>
                </div>
            <div className="post-options">
                    <MoreHorizontal size={20} className="more-options" onClick={() => setShowPostOptions(!showPostOptions)} />
                    {showPostOptions && (
                        <div className="options-dropdown" ref={postOptionsRef}>
                            <button onClick={handleEditPost}><Edit size={16} /> Edit</button>
                            <button onClick={handleDeletePost}><Trash2 size={16} /> Delete</button>
                        </div>
                    )}
                </div>
            </div>
            <div className="post-content">
                {localPost.title && (
                    <Link to={`/thread/${localPost.threadId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h4 className="thread-title">{localPost.title}</h4>
                    </Link>
                )}
                {editingPost ? (
                    <div className="edit-post-container">
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="edit-textarea"
                        />
                        <div className="edit-buttons">
                            <button onClick={handleUpdatePost} className="btn btn-save">Save</button>
                            <button onClick={() => {
                                setEditingPost(false);
                                setEditedContent('');
                            }} className="btn btn-cancel">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <ContentRenderer content={renderContent()} />
                        {localPost.images && localPost.images.length > 0 && (
                            <div className="post-images">
                                {localPost.images.map((image, index) => (
                                    <img 
                                        key={index} 
                                        src={`${config.apiUrl}/${image}`} 
                                        alt={`Post image ${index + 1}`} 
                                        className="post-image"
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="post-actions">
                <button onClick={handleLike} className={`like-button ${isLiked ? 'liked' : ''}`}>
                    <Heart size={20} fill={isLiked ? "#ff0000" : "none"} stroke={isLiked ? "#ff0000" : "currentColor"} />
                    {localPost.likes.length}
                </button>
                <button><MessageCircle size={20} /> {comments.length}</button>
                <button onClick={handleShareClick}><Share2 size={20} /></button>
            </div>
            {showSharePopup && (
                <div className="share-popup">
                    <div className="share-popup-content">
                        <h4>Share this post</h4>
                        <div className="share-link">
                            <input 
                                type="text" 
                                value={`${window.location.origin}/thread/${localPost.threadId}`} 
                                readOnly 
                            />
                            <button onClick={copyToClipboard}>
                                <Copy size={20} />
                            </button>
                        </div>
                        {copySuccess && <p className="copy-success">{copySuccess}</p>}
                        <button onClick={() => setShowSharePopup(false)} className="close-popup">Close</button>
                    </div>
                </div>
            )}
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
                                <div className="edit-comment-container">
                                    <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="edit-textarea"
                                    />
                                    <div className="edit-buttons">
                                        <button onClick={() => handleUpdateComment(comment._id)} className="btn btn-save">Save</button>
                                        <button onClick={() => {
                                            setEditingComment(null);
                                            setEditedContent('');
                                        }} className="btn btn-cancel">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <p>{comment.content}</p>
                            )}
                        </div>
                        <div className="comment-options">
                            <MoreHorizontal size={16} onClick={() => setCommentOptionsId(comment._id)} />
                            {commentOptionsId === comment._id && (
                                <div className="options-dropdown" ref={commentOptionsRef}>
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