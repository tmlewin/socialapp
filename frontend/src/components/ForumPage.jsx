import React, { useState, useEffect } from 'react';
import axios from '../axios';
import ThreadList from './ThreadList';
import CreateThreadComponent from './CreateThreadComponent'; // Updated import
import './css/ForumPage.css';

const ForumPage = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchThreads = async () => {
            try {
                const response = await axios.get('/api/threads');
                if (isMounted) {
                    setThreads(response.data);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching threads:', error);
                if (isMounted) {
                    setError('Failed to fetch threads. Please try again later.');
                    setLoading(false);
                }
            }
        };

        fetchThreads();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleThreadCreated = (newThread) => {
        setThreads(prevThreads => [newThread, ...prevThreads]);
    };

    if (loading) return <div>Loading forum...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="forum-page">
            <h1>Forum Threads</h1>
            <CreateThreadComponent onThreadCreated={handleThreadCreated} />
            {threads.length === 0 ? (
                <p>No threads found. Be the first to create a thread!</p>
            ) : (
                <ThreadList threads={threads} />
            )}
        </div>
    );
};

export default ForumPage;