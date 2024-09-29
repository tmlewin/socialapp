import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';
import CreateThreadComponent from './CreateThreadComponent'; // Updated import
import './css/ThreadsPage.css';

const ThreadsPage = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchThreads();
    }, []);

    const fetchThreads = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/threads');
            setThreads(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching threads:', err);
            setError('Failed to fetch threads. Please try again later.');
            setLoading(false);
        }
    };

    const handleThreadCreated = (newThread) => {
        setThreads(prevThreads => [newThread, ...prevThreads]);
    };

    if (loading) return <div>Loading threads...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="threads-page">
            <h1>Forum Threads</h1>
            <CreateThreadComponent onThreadCreated={handleThreadCreated} />
            {threads.length === 0 ? (
                <p>No threads found. Be the first to create a thread!</p>
            ) : (
                <div className="thread-list">
                    {threads.map(thread => (
                        <div key={thread._id} className="thread-item">
                            <Link to={`/thread/${thread._id}`}>
                                <h2>{thread.title}</h2>
                            </Link>
                            <p>Created by: {thread.user}</p>
                            <p>Posts: {thread.postCount || 0}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThreadsPage;