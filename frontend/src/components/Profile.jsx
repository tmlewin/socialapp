import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../axios';
import './css/Profile.css';
import { MessageSquare, PenTool, Vote, Award } from 'lucide-react';
import Messaging from './Messaging';

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [preview, setPreview] = useState('');
    const [activityFeed, setActivityFeed] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [updateNotificationCount, setUpdateNotificationCount] = useState(() => () => {});

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

                // Trigger achievement check
                await axios.post('/api/achievements/check');
                
                // Fetch updated achievements
                const achievementsResponse = await axios.get('/api/achievements');
                setAchievements(achievementsResponse.data);
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

    useEffect(() => {
        const fetchUserActivity = async () => {
            try {
                const response = await axios.get('/api/users/activity');
                setActivityFeed(response.data);
            } catch (error) {
                console.error('Error fetching user activity:', error);
                setError('Failed to load user activity. Please try again.');
            }
        };

        if (user) {
            fetchUserActivity();
        }
    }, [user]);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const [userAchievements, allAchievements] = await Promise.all([
                    axios.get('/api/achievements'),
                    axios.get('/api/achievements/all')
                ]);
                console.log('Fetched user achievements:', userAchievements.data);
                console.log('All available achievements:', allAchievements.data);
                console.log('Number of all achievements:', allAchievements.data.length);
                setAchievements(userAchievements.data);
            } catch (error) {
                console.error('Error fetching achievements:', error);
            }
        };

        if (user) {
            fetchAchievements();
        }
    }, [user]);

    useEffect(() => {
        // Set active tab if provided in location state
        if (location.state && location.state.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location]);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await axios.get('/api/messages/unread-count');
                // Assuming you have a way to update the notification count in the Header component
                // This could be through a global state management solution or a callback passed down from App.js
                if (typeof window.updateHeaderNotificationCount === 'function') {
                    window.updateHeaderNotificationCount(response.data.count);
                }
            } catch (error) {
                console.error('Error fetching unread message count:', error);
            }
        };

        setUpdateNotificationCount(() => fetchUnreadCount);
    }, []);

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
            setPreview(''); // Clear the preview after successful upload
            setNewProfilePicture(null); // Clear the selected file
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
            setNewProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const renderActivityItem = (activity) => {
        switch (activity.type) {
            case 'post':
                return (
                    <div className="activity-item">
                        <PenTool size={16} />
                        <span>Created a post: {activity.content}</span>
                    </div>
                );
            case 'comment':
                return (
                    <div className="activity-item">
                        <MessageSquare size={16} />
                        <span>Commented on a post: {activity.content}</span>
                    </div>
                );
            case 'poll':
                return (
                    <div className="activity-item">
                        <Vote size={16} />
                        <span>Created a poll: {activity.content}</span>
                    </div>
                );
            case 'vote':
                return (
                    <div className="activity-item">
                        <Vote size={16} />
                        <span>Voted on a poll: {activity.content}</span>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderAchievements = () => {
        const allAchievements = [
            { name: 'First Post', icon: '📝', description: 'Create your first post' },
            { name: 'Prolific Poster', icon: '✍️', description: 'Create 10 posts' },
            { name: 'Power Poster', icon: '🚀', description: 'Create 50 posts' },
            { name: 'Comment Contributor', icon: '💬', description: 'Leave your first comment' },
            { name: 'Frequent Commenter', icon: '🗨️', description: 'Leave 10 comments' },
            { name: 'Discussion Master', icon: '🏆', description: 'Leave 50 comments' },
            { name: 'Poll Creator', icon: '📊', description: 'Create your first poll' },
            { name: 'Active Voter', icon: '🗳️', description: 'Vote in 5 polls' },
        ];

        return (
            <div className="achievements-section">
                <h2>Achievements</h2>
                <div className="achievements-list">
                    {allAchievements.map((achievement) => {
                        const userHasAchievement = achievements.some(a => a.name === achievement.name);
                        return (
                            <div key={achievement.name} className={`achievement-item ${userHasAchievement ? '' : 'achievement-locked'}`}>
                                <div className="achievement-icon" role="img" aria-label={achievement.name}>
                                    {achievement.icon}
                                </div>
                                <div className="achievement-info">
                                    <h3>{achievement.name}</h3>
                                    <p>{achievement.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
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
                    className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                >
                    Activity Feed
                </button>
                <button 
                    className={`tab ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                >
                    Change Password
                </button>
                <button 
                    className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('achievements')}
                >
                    Achievements
                </button>
                <button 
                    className={`tab ${activeTab === 'messaging' ? 'active' : ''}`}
                    onClick={() => setActiveTab('messaging')}
                >
                    Messaging
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

                {activeTab === 'activity' && (
                    <div className="activity-feed">
                        <h2>Recent Activity</h2>
                        {activityFeed.length === 0 ? (
                            <p>No recent activity.</p>
                        ) : (
                            activityFeed.map((activity, index) => (
                                <div key={index} className="activity-item-container">
                                    {renderActivityItem(activity)}
                                    <span className="activity-date">{new Date(activity.date).toLocaleDateString()}</span>
                                </div>
                            ))
                        )}
                    </div>
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

                {activeTab === 'achievements' && renderAchievements()}
                {activeTab === 'messaging' && <Messaging userId={user._id} />}
            </div>
        </div>
    );
};

export default Profile;
