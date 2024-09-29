import React, { useState } from 'react';
import axios from '../axios';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            const userDataToStore = {
                ...response.data.user,
                token: response.data.token
            };
            localStorage.setItem('user', JSON.stringify(userDataToStore));
            onLogin(userDataToStore);
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            setError('Invalid username or password');
        }
    };

    return (
        <div className="login">
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;