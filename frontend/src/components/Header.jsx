import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import './css/Header.css'
import { Bell, User, LogOut } from 'lucide-react';

export default function Header({ onLogout }) {
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <header className={`header ${isSticky ? 'sticky' : ''}`}>
            <div className="header-content">
                <h1>Socially Social</h1>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/forum">Forum</Link>
                    <Link to="/threads">Threads</Link>
                    <Link to="/profile">Profile</Link>
                </nav>
                <div className="header-actions">
                    <Bell size={24} />
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
