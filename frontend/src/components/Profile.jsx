import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import './css/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [preview, setPreview] = useState('');

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) 
            ? date.toISOString().split('T')[0]
            : '';
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/api/users/profile');
                setUser(response.data);
                setFormData({
                    ...response.data,
                    dateOfBirth: formatDate(response.data.dateOfBirth)
                });
                // Set the preview to the user's profile picture
                setPreview(response.data.profilePicture);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    setError('Failed to load profile. Please try again.');
                }
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'dateOfBirth') {
            // For date inputs, store the value as is
            setFormData({ ...formData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formDataToSubmit = new FormData();
        // Append the profile picture if it exists
        if (newProfilePicture) {
            formDataToSubmit.append('profilePicture', newProfilePicture);
        }

        // Append other form data
        for (const key in formData) {
            formDataToSubmit.append(key, formData[key]);
        }

        try {
            const response = await axios.put('/api/users/profile', formDataToSubmit, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUser(response.data);
            setFormData({
                ...response.data,
                dateOfBirth: formatDate(response.data.dateOfBirth)
            });
            setSuccess('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        try {
            await axios.put('/api/users/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setSuccess('Password changed successfully!');
            setFormData({...formData, currentPassword: '', newPassword: '', confirmPassword: ''});
        } catch (error) {
            console.error('Error changing password:', error);
            setError('Failed to change password. Please check your current password and try again.');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setNewProfilePicture(file);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) return <div className="loading">Loading...</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-picture-container">
                    <img
                        src={preview || user.profilePicture || "https://via.placeholder.com/100"}
                        alt="Profile"
                        className="profile-picture"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/100"; }}
                    />
                    <div className="overlay">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="file-input"
                        />
                        <label htmlFor="file-input" className="edit-icon">
                            <span>Edit</span>
                        </label>
                    </div>
                </div>
                <div className="profile-info">
                    <h1>{user.displayName || user.username}</h1>
                    <p className="username">@{user.username}</p>
                    <p className="email">{user.email}</p>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="profile-tabs">
                <button 
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Information
                </button>
                <button 
                    className={`tab ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                >
                    Change Password
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'profile' && (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="displayName">Display Name</label>
                            <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={formData.displayName || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dateOfBirth">Date of Birth</label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="bio">Bio</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="website">Website</label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button type="submit" className="submit-button">Save Changes</button>
                    </form>
                )}

                {activeTab === 'password' && (
                    <form onSubmit={handlePasswordChange} className="password-form">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button">Change Password</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;