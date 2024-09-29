import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';
import './css/ThreadsPage.css';

const ThreadsPage = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const response = await axios.get('/api/threads');
                setThreads(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch threads. Please try again later.');
                setLoading(false);
            }
        };

        fetchThreads();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="threads-page">
            <h1>Forum Threads</h1>
            <div className="thread-list">
                {threads.map(thread => (
                    <div key={thread._id} className="thread-item">
                        <Link to={`/thread/${thread._id}`}>
                            <h2>{thread.title}</h2>
                        </Link>
                        <p>Created by: {thread.user}</p>
                        <p>Posts: {thread.postCount}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThreadsPage;