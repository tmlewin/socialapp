import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';
import Feed from './components/Feed';
import Header from './components/Header';
import AuthForm from './components/AuthForm';
import Profile from './components/Profile';
import ThreadsPage from './components/ThreadsPage';
import ForumPage from './components/ForumPage';
import { updateContext } from './context/updateContext';
import ThreadView from './components/ThreadView';
import Dashboard from './components/Dashboard';
import PollsPage from './components/PollsPage';
import PollView from './components/PollView';

function App() {
    const [user, setUser] = useState(null);
    const [updater, setUpdater] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }, []);

    const handleAuth = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <Router>
            <NotificationProvider>
                <div className="App">
                    <updateContext.Provider value={[updater, setUpdater]}>
                        {user ? (
                            <>
                                <Header onLogout={handleLogout} />
                                <Routes>
                                    <Route path="/" element={<Feed />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/threads" element={<ThreadsPage />} />
                                    <Route path="/forum" element={<ForumPage />} />
                                    <Route path="/thread/:threadId" element={<ThreadView />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/polls" element={<PollsPage />} />
                                    <Route path="/polls/:pollId" element={<PollView />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </>
                        ) : (
                            <AuthForm onAuthSuccess={handleAuth} />
                        )}
                    </updateContext.Provider>
                </div>
            </NotificationProvider>
        </Router>
    );
}

export default App;
