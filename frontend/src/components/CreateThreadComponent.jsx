import React, { useState } from 'react';
import axios from '../axios';
import './css/CreateThreadComponent.css';

const CreateThreadComponent = ({ onThreadCreated }) => {
    const [title, setTitle] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/threads', { title });
            onThreadCreated(response.data);
            setTitle('');
        } catch (error) {
            console.error('Error creating thread:', error.response?.data || error.message);
            // You might want to show an error message to the user here
        }
    };

    return (
        <div className="create-thread">
            <h2>Create a New Thread</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Thread Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <button type="submit">Create Thread</button>
            </form>
        </div>
    );
};

export default CreateThreadComponent;