import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Eye, Clock, Bookmark } from 'lucide-react';
import './css/ThreadList.css';

const ThreadList = ({ threads }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="thread-list">
            {threads.map(thread => (
                <div key={thread._id} className="thread-card">
                    <div className="thread-card-main">
                        <div className="thread-card-header">
                            <div className="thread-status-indicators">
                                {thread.isLocked && <span className="status locked">Locked</span>}
                                {thread.isPinned && <span className="status pinned">Pinned</span>}
                            </div>
                            <Link to={`/thread/${thread._id}`} className="thread-title">
                                <h2>{thread.title}</h2>
                            </Link>
                        </div>
                        
                        <div className="thread-meta">
                            <div className="thread-author">
                                <img 
                                    src={thread.userProfilePicture || "https://via.placeholder.com/32"} 
                                    alt={thread.user} 
                                    className="author-avatar"
                                />
                                <span>{thread.user}</span>
                            </div>
                            <div className="thread-stats">
                                <span className="stat">
                                    <MessageCircle size={16} />
                                    {thread.postCount || 0}
                                </span>
                                <span className="stat">
                                    <Eye size={16} />
                                    {thread.viewCount || 0}
                                </span>
                                <span className="stat">
                                    <Clock size={16} />
                                    {formatDate(thread.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="thread-actions">
                        <button className="action-btn bookmark">
                            <Bookmark size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ThreadList;
