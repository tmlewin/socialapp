import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, Heart, TrendingUp, Award } from 'lucide-react';
import axios from '../axios';
import './css/Dashboard.css';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = () => {
    const [activityData, setActivityData] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalLikes: 0,
        activeUsers: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [topPosts, setTopPosts] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [statsResponse, activityResponse, topPostsResponse] = await Promise.all([
                    axios.get('/api/dashboard/stats'),
                    axios.get('/api/dashboard/activity'),
                    axios.get('/api/dashboard/top-posts')
                ]);

                setStats(statsResponse.data);
                setActivityData(activityResponse.data);
                setTopPosts(topPostsResponse.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <Users size={24} />
                    <h3>Total Users</h3>
                    <p>{stats.totalUsers}</p>
                </div>
                <div className="stat-card">
                    <MessageSquare size={24} />
                    <h3>Total Posts</h3>
                    <p>{stats.totalPosts}</p>
                </div>
                <div className="stat-card">
                    <Heart size={24} />
                    <h3>Total Likes</h3>
                    <p>{stats.totalLikes}</p>
                </div>
                <div className="stat-card">
                    <TrendingUp size={24} />
                    <h3>Active Users</h3>
                    <p>{stats.activeUsers}</p>
                </div>
            </div>
            <div className="chart-container">
                <h2>Weekly Activity</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="posts" fill="#8884d8" />
                        <Bar dataKey="comments" fill="#82ca9d" />
                        <Bar dataKey="likes" fill="#ffc658" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="top-posts">
                <h2>Top Performing Posts</h2>
                <ul>
                    {topPosts.map((post, index) => (
                        <li key={post._id}>
                            <Award size={16} />
                            <span>{post.title}</span>
                            <span>{post.likesCount} likes</span>
                            <span>{post.commentsCount} comments</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
