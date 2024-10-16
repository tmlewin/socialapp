import React, { useState } from 'react';
import axios from '../axios';
import { Eye } from 'lucide-react';
import './css/AuthForm.css';

const AuthForm = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [website, setWebsite] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const userData = isLogin ? { username, password } : {
                username, password, email, displayName, fullName, dateOfBirth, location, bio, website
            };
            const response = await axios.post(endpoint, userData);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (typeof onAuthSuccess === 'function') {
                    onAuthSuccess(response.data.user);
                } else {
                    console.error('onAuthSuccess is not a function');
                    setError('An error occurred during authentication. Please try again.');
                }
            } else {
                setError('Authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Auth error:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(`Error ${error.response.status}: ${error.response.data.message || 'An error occurred'}`);
            } else if (error.request) {
                // The request was made but no response was received
                setError('No response received from the server. Please try again later.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="auth-form-container">
            <div className="auth-form">
                <h1>Welcome back</h1>
                <p>{isLogin ? 'Enter your credentials to access your account' : 'Create an account to start using threads'}</p>
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
                        <>
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
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="displayName">Display Name</label>
                                <input
                                    type="text"
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dateOfBirth">Date of Birth</label>
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="bio">Bio</label>
                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="website">Website</label>
                                <input
                                    type="url"
                                    id="website"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>
                        </>
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