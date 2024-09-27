import React, { useState } from 'react';
import axios from '../axios';
import './css/CreatePost.css';
import { Share2 } from 'lucide-react';

export default function CreatePost({ onPostCreated }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.post('/api/posts', {
                title,
                content,
                userId: user._id,
                user: user.username,
                userProfilePicture: user.profilePicture || "https://via.placeholder.com/40"
            });
            onPostCreated(response.data);
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <div className="create-post">
            <h2>Create a Post</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title (Optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <div className="post-actions">
                    <Share2 size={20} />
                    <button type="submit" className="post-button" style={{ backgroundColor: 'black', color: 'white' }}>Post</button>
                </div>
            </form>
        </div>
    );
}
