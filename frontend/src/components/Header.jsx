import React from 'react'
import './css/Header.css'
import { Bell, User, LogOut } from 'lucide-react';

export default function Header({ onLogout }) {
    return (
        <header className="header">
            <h1>Socially Social</h1>
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
