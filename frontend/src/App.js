import React, { useState, useEffect } from 'react';
import './App.css';
import Feed from './components/Feed';
import Header from './components/Header';
import AuthForm from './components/AuthForm';
import { updateContext } from './context/updateContext';

function App() {
    const [updater, setUpdater] = useState(0);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const handleAuth = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <div className="App">
            <updateContext.Provider value={[updater, setUpdater]}>
                {user ? (
                    <>
                        <Header onLogout={handleLogout} />
                        <Feed />
                    </>
                ) : (
                    <AuthForm onAuth={handleAuth} />
                )}
            </updateContext.Provider>
        </div>
    );
}

export default App;
