import React, { useState } from 'react';
import axios from '../axios';
import './css/CreatePost.css';

const CreatePost = ({ threadId, onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/posts', { threadId, title, content });
            onPostCreated(response.data);
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error creating post:', error.response?.data || error.message);
        }
    };

    return (
        <div className="create-post">
            <h3>Add a New Post</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Write your post here"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <button type="submit">Submit Post</button>
            </form>
        </div>
    );
};

export default CreatePost;
