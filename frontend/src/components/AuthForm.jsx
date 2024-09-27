import React, { useState } from 'react';
import axios from '../axios';
import { Eye } from 'lucide-react';
import './css/AuthForm.css';

const AuthForm = ({ onAuth }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (!isLogin && password !== confirmPassword) {
                setError("Passwords don't match");
                return;
            }
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const response = await axios.post(endpoint, { username, password });
            localStorage.setItem('user', JSON.stringify(response.data));
            onAuth(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="auth-form-container">
            <div className="auth-form">
                <h1>Welcome back</h1>
                <p>Enter your credentials to access your account</p>
                <div className="auth-toggle">
                    <button 
                        className={isLogin ? 'active' : ''} 
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button 
                        className={!isLogin ? 'active' : ''} 
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Eye 
                                className="password-toggle" 
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="submit-btn">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
                <p className="terms">
                    Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service
                </p>
            </div>
        </div>
    );
};

export default AuthForm;