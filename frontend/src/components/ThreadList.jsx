import React from 'react';
import { Link } from 'react-router-dom';
import './css/ThreadList.css';

const ThreadList = ({ threads }) => {
    return (
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
    );
};

export default ThreadList;