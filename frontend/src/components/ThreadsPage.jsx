import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Filter, Search, Plus, X } from 'lucide-react';
import CreateThreadComponent from './CreateThreadComponent';
import ThreadList from './ThreadList';
import './css/ThreadsPage.css';

const ThreadsPage = () => {
    const [threads, setThreads] = useState([]);
    const [filteredThreads, setFilteredThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateThread, setShowCreateThread] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        sortBy: 'newest', // newest, oldest, mostActive
        timeFrame: 'all', // all, today, week, month
    });

    useEffect(() => {
        fetchThreads();
    }, []);

    useEffect(() => {
        filterThreads();
    }, [threads, searchTerm, filters]);

    const fetchThreads = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/threads');
            setThreads(response.data);
            setFilteredThreads(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching threads:', err);
            setError('Failed to fetch threads. Please try again later.');
            setLoading(false);
        }
    };

    const filterThreads = () => {
        let filtered = [...threads];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(thread =>
                thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                thread.user.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply time frame filter
        if (filters.timeFrame !== 'all') {
            const now = new Date();
            const timeFrames = {
                today: 24 * 60 * 60 * 1000,
                week: 7 * 24 * 60 * 60 * 1000,
                month: 30 * 24 * 60 * 60 * 1000
            };
            filtered = filtered.filter(thread => {
                const threadDate = new Date(thread.createdAt);
                return now - threadDate <= timeFrames[filters.timeFrame];
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'mostActive':
                    return (b.postCount || 0) - (a.postCount || 0);
                case 'newest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        setFilteredThreads(filtered);
    };

    const handleThreadCreated = (newThread) => {
        setThreads(prevThreads => [newThread, ...prevThreads]);
        setShowCreateThread(false);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    if (loading) return <div className="loading-spinner">Loading threads...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="threads-page">
            <div className="threads-header">
                <h1>Forum Discussions</h1>
                <button 
                    className="create-thread-btn"
                    onClick={() => setShowCreateThread(true)}
                >
                    <Plus size={20} />
                    New Thread
                </button>
            </div>

            <div className="threads-controls">
                <div className="threads-search-bar">
                    <Search size={20} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search threads..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={clearSearch}>
                            <X size={16} />
                        </button>
                    )}
                </div>
                
                <button 
                    className={`filter-btn ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={20} />
                    Filter
                </button>
            </div>

            {showFilters && (
                <div className="filter-options">
                    <div className="filter-group">
                        <label>Sort by:</label>
                        <select 
                            value={filters.sortBy}
                            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="mostActive">Most Active</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Time Frame:</label>
                        <select 
                            value={filters.timeFrame}
                            onChange={(e) => setFilters({...filters, timeFrame: e.target.value})}
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
            )}

            {showCreateThread && (
                <div className="create-thread-modal">
                    <CreateThreadComponent 
                        onThreadCreated={handleThreadCreated}
                        onClose={() => setShowCreateThread(false)}
                    />
                </div>
            )}

            {filteredThreads.length === 0 ? (
                <div className="no-threads">
                    <p>No threads found. {searchTerm ? 'Try a different search term.' : 'Be the first to create a thread!'}</p>
                </div>
            ) : (
                <ThreadList threads={filteredThreads} />
            )}
        </div>
    );
};

export default ThreadsPage;
