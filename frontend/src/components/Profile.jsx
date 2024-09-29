import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from useHistory to useNavigate
import axios from '../axios';
import './css/Profile.css';

const Profile = () => {
    const navigate = useNavigate(); // Changed from useHistory()
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/api/users/profile');
                setUser(response.data);
                setFormData(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                if (error.response && error.response.status === 401) {
                    // Token is invalid or expired
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    setError('Failed to load profile. Please try again.');
                }
            }
        };

        fetchUserProfile();
    }, [navigate]); // Added navigate to the dependency array

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await axios.put('/api/users/profile', formData);
            setUser(response.data);
            setIsEditing(false);
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

    if (!user) return <div>Loading...</div>;

    return (
        <div className="profile-container">
            <h1>User Profile</h1>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div className="profile-info">
                <img src={user.profilePicture} alt="Profile" className="profile-picture" />
                <h2>{user.displayName || user.username}</h2>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <button onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
            </div>
            {isEditing && (
                <form onSubmit={handleSubmit} className="profile-form">
                    <h3>Edit Profile Information</h3>
                    <input
                        type="text"
                        name="displayName"
                        value={formData.displayName || ''}
                        onChange={handleInputChange}
                        placeholder="Display Name"
                    />
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                    />
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth || ''}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleInputChange}
                        placeholder="Location"
                    />
                    <textarea
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleInputChange}
                        placeholder="Bio"
                    />
                    <input
                        type="text"
                        name="website"
                        value={formData.website || ''}
                        onChange={handleInputChange}
                        placeholder="Website"
                    />
                    <button type="submit">Save Changes</button>
                </form>
            )}
            <form onSubmit={handlePasswordChange} className="password-form">
                <h3>Change Password</h3>
                <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword || ''}
                    onChange={handleInputChange}
                    placeholder="Current Password"
                    required
                />
                <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword || ''}
                    onChange={handleInputChange}
                    placeholder="New Password"
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleInputChange}
                    placeholder="Confirm New Password"
                    required
                />
                <button type="submit">Change Password</button>
            </form>
        </div>
    );
};

export default Profile;