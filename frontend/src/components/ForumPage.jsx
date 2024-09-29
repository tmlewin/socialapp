import React, { useState, useEffect } from 'react';
import axios from '../axios';
import ThreadList from './ThreadList';
import CreatePost from './CreatePost';
import './css/ForumPage.css';

const ForumPage = () => {
    const [threads, setThreads] = useState([]);

    useEffect(() => {
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        try {
            const response = await axios.get('/api/threads');
            setThreads(response.data);
        } catch (error) {
            console.error('Error fetching threads:', error);
        }
    };

    const handleThreadCreated = (newThread) => {
        setThreads(prevThreads => [newThread, ...prevThreads]);
    };

    return (
        <div className="forum-page">
            <h1>Forum Threads</h1>
            <CreatePost onPostCreated={handleThreadCreated} />
            <ThreadList threads={threads} />
        </div>
    );
};

export default ForumPage;