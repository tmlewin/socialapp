import React, { useState } from 'react';
import axios from '../axios';
import './css/CreatePost.css';
import { Share2 } from 'lucide-react';

export default function CreatePost({ onPostCreated, threadId }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            let response;
            
            if (threadId) {
                // Creating a post in an existing thread
                response = await axios.post('/api/posts', {
                    title,
                    content,
                    userId: user._id,
                    user: user.username,
                    userProfilePicture: user.profilePicture || "https://via.placeholder.com/40",
                    threadId
                });
            } else {
                // Creating a new thread
                response = await axios.post('/api/threads', {
                    title,
                    userId: user._id,
                    user: user.username
                });
            }
            
            onPostCreated(response.data);
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error creating post/thread:', error);
        }
    };

    return (
        <div className="create-post">
            <h2>{threadId ? "Create a Post" : "Create a New Thread"}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder={threadId ? "Post Title" : "Thread Title"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                {threadId && (
                    <textarea
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                )}
                <div className="post-actions">
                    <Share2 size={20} />
                    <button type="submit" className="post-button" style={{ backgroundColor: 'black', color: 'white' }}>
                        {threadId ? "Post" : "Create Thread"}
                    </button>
                </div>
            </form>
        </div>
    );
}
