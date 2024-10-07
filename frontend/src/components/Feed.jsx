import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from '../axios';
import { updateContext } from '../context/updateContext';
import Post from './Post';
import SearchBar from './SearchBar';
import LoadingSpinner from './LoadingSpinner';
import './css/Feed.css';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [updater, setUpdater] = useContext(updateContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loader = useRef(null);

    const fetchPosts = useCallback(async (pageNum) => {
        if (!hasMore && pageNum !== 1) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/posts?page=${pageNum}&limit=10`);
            const newPosts = response.data.posts.map(post => ({
                ...post,
                userProfilePicture: post.userProfilePicture || post.userId.profilePicture
            }));

            setPosts(prevPosts => pageNum === 1 ? newPosts : [...prevPosts, ...newPosts]);
            setFilteredPosts(prevPosts => pageNum === 1 ? newPosts : [...prevPosts, ...newPosts]);
            setHasMore(response.data.hasMore);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to fetch posts. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
        fetchPosts(1);
    }, [updater, fetchPosts]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: "20px",
            threshold: 1.0
        };

        const observer = new IntersectionObserver(handleObserver, options);
        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, [hasMore, isLoading]);

    const handleObserver = useCallback((entities) => {
        const target = entities[0];
        if (target.isIntersecting && hasMore && !isLoading) {
            setPage((prevPage) => prevPage + 1);
        }
    }, [hasMore, isLoading]);

    useEffect(() => {
        if (page > 1) {
            fetchPosts(page);
        }
    }, [page, fetchPosts]);

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
        setPosts(prevPosts => {
            const updatedPosts = prevPosts.map(post => 
                post._id === updatedPost._id ? updatedPost : post
            );
            return updatedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
    }, []);

    const handlePostDelete = useCallback((deletedPostId) => {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
    }, []);

    return (
        <div className="feed">
            <SearchBar onSearch={handleSearch} />
            {filteredPosts.map(post => (
                <Post 
                    key={post._id} 
                    post={post}
                    onPostUpdate={handlePostUpdate}
                    onPostDelete={handlePostDelete}
                />
            ))}
            {isLoading && <LoadingSpinner />}
            {error && <p className="error-message">{error}</p>}
            {hasMore && <div ref={loader} style={{ height: '20px', margin: '20px 0' }} />}

        </div>
    );
}