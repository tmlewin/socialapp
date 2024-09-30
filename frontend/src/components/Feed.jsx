import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from '../axios';
import { updateContext } from '../context/updateContext';
import Post from './Post';
import SearchBar from './SearchBar';
import './css/Feed.css';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [updater, setUpdater] = useContext(updateContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, [updater]);

    const fetchPosts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/posts');
            const updatedPosts = response.data.map(post => ({
                ...post,
                userProfilePicture: post.userProfilePicture || post.userId.profilePicture
            }));
            setPosts(updatedPosts);
            setFilteredPosts(updatedPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to fetch posts. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = useCallback((searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredPosts(posts);
        } else {
            const filtered = posts.filter(post =>
                post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPosts(filtered);
        }
    }, [posts]);

    const handlePostUpdate = useCallback((updatedPost) => {
        console.log('handlePostUpdate called with:', updatedPost); // Add this line
        setPosts(prevPosts => {
            const updatedPosts = prevPosts.map(post => 
                post._id === updatedPost._id ? updatedPost : post
            );
            return updatedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
    }, []);

    const handlePostDelete = (deletedPostId) => {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
    };

    return (
        <div className="feed">
            <SearchBar onSearch={handleSearch} />
            {isLoading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {filteredPosts.map(post => (
                <Post 
                    key={post._id} 
                    post={post}
                    onPostUpdate={handlePostUpdate}
                    onPostDelete={handlePostDelete}
                />
            ))}
        </div>
    );
}