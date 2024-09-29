import React from 'react'
import { Link } from 'react-router-dom';
import './css/Header.css'
import { Bell, User, LogOut } from 'lucide-react';

export default function Header({ onLogout }) {
    return (
        <header className="header">
            <h1>Socially Social</h1>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/forum">Forum</Link>
                <Link to="/threads">Threads</Link>
            </nav>
            <div className="header-actions">
                <Bell size={24} />
                <User size={24} />
                <button onClick={onLogout} className="logout-btn">
                    <LogOut size={24} />
                    Logout
                </button>
            </div>
        </header>
    );
}
