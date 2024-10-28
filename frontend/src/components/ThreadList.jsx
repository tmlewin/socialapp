import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Eye, Clock, Bookmark, CheckCircle } from 'lucide-react';
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

    const formatLastActivity = (dateString) => {
        const now = new Date();
        const activity = new Date(dateString);
        const diffInMinutes = Math.floor((now - activity) / (1000 * 60));
        const diffInHours = diffInMinutes / 60;
        const diffInDays = diffInHours / 24;

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInDays < 7) return `${Math.floor(diffInDays)}d ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
        return formatDate(dateString);
    };

    const isThreadUnread = (thread) => {
        const userId = localStorage.getItem('userId');
        if (!userId) return false;

        // Consider a thread "new/unread" if:
        // 1. The user hasn't read it (not in readBy array)
        // 2. The thread is less than 7 days old
        const isNotRead = !thread.readBy?.some(read => read.userId === userId);
        const threadDate = new Date(thread.createdAt);
        const isRecent = (Date.now() - threadDate) < (7 * 24 * 60 * 60 * 1000); // 7 days

        return isNotRead && isRecent;
    };

    return (
        <div className="thread-list">
            {threads.map(thread => (
                <div key={thread._id} className={`thread-card ${isThreadUnread(thread) ? 'unread' : ''}`}>
                    <div className="thread-card-main">
                        <div className="thread-card-header">
                            <div className="thread-status-indicators">
                                {isThreadUnread(thread) && <span className="status unread">New</span>}
                                {thread.isLocked && <span className="status locked">Locked</span>}
                                {thread.isPinned && <span className="status pinned">Pinned</span>}
                                {thread.isSolved && <span className="status solved"><CheckCircle size={14} /> Solved</span>}
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
                        
                        <div className="thread-last-activity">
                            <Clock size={14} />
                            Last activity: {formatLastActivity(thread.lastActivity)}
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
