import React, { useState, useContext } from 'react';
import axios from '../axios';
import { updateContext } from '../context/updateContext';
import './css/Posts.css';

export default function Posts({ posts, setPosts }) {
    const [updater, setUpdater] = useContext(updateContext);
    const [editId, setEditId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const user = JSON.parse(localStorage.getItem('user')) || { _id: '123', username: 'tannerkc' };

    const handleDelete = async (id) => {
        try {
            await axios.post('/api/posts/delete', { id });
            setPosts(prevPosts => prevPosts.filter(post => post._id !== id));
            setUpdater(state => state + 1);
        } catch (error) {
            console.error("Error deleting post:", error);
            // You might want to show an error message to the user here
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await axios.put(`/api/posts/${id}`, { content: editContent, userId: user._id });
            setPosts(prevPosts => prevPosts.map(post => 
                post._id === id ? { ...post, content: editContent } : post
            ));
            setEditId(null);
            setEditContent('');
            setUpdater(state => state + 1);
        } catch (error) {
            console.error("Error updating post:", error);
            // You might want to show an error message to the user here
        }
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(prevPosts => prevPosts.map(post => 
            post._id === updatedPost._id ? updatedPost : post
        ));
    };

    const handlePostDelete = (deletedPostId) => {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
    };

    return (
        <div className="posts__container">
            {posts && posts.map(post => (
                <div className="post" key={post._id}>
                    <div className="post__details">
                        <img 
                            className="avatar" 
                            src={post.userProfilePicture || "https://via.placeholder.com/40"} 
                            alt="" 
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }}
                        />
                        <div>
                            <h3>{post.user}</h3>
                            {editId === post._id ? (
                                <input 
                                    type="text" 
                                    value={editContent} 
                                    onChange={(e) => setEditContent(e.target.value)}
                                />
                            ) : (
                                <p>{post.content}</p>
                            )}
                        </div>
                    </div>
                    {post.userId === user._id && (
                        <div className="post__buttons">
                            {editId === post._id ? (
                                <>
                                    <button onClick={() => handleEdit(post._id)} className="btn-save">Save</button>
                                    <button onClick={() => setEditId(null)} className="btn-cancel">Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => {
                                        setEditId(post._id);
                                        setEditContent(post.content);
                                    }} className="btn-edit">Edit</button>
                                    <button onClick={() => handleDelete(post._id)} className="btn-delete">Delete</button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}