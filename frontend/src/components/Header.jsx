import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import './css/Header.css'
import { Bell, User, LogOut } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function Header({ onLogout }) {
    const [isSticky, setIsSticky] = useState(false);
    const { unreadCount, updateUnreadCount } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        updateUnreadCount();
        // Set up polling for real-time updates
        const intervalId = setInterval(updateUnreadCount, 60000); // Poll every minute

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(intervalId);
        };
    }, [updateUnreadCount]);

    const handleNotificationClick = () => {
        navigate('/profile', { state: { activeTab: 'messaging' } });
    };

    return (
        <header className={`header ${isSticky ? 'sticky' : ''}`}>
            <div className="header-content">
                <h1>Socially Social</h1>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/forum">Forum</Link>
                    <Link to="/threads">Threads</Link>
                    <Link to="/profile">Profile</Link>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/polls">Polls</Link>
                </nav>
                <div className="header-actions">
                    <div className="notification-icon" onClick={handleNotificationClick}>
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="notification-count">{unreadCount}</span>
                        )}
                    </div>
                    <User size={24} />
                    <button onClick={onLogout} className="logout-btn">
                        <LogOut size={24} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
