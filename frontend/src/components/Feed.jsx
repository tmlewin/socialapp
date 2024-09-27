import React, { useState, useEffect, useContext } from 'react';
import axios from '../axios';
import { updateContext } from '../context/updateContext';
import CreatePost from './CreatePost';
import Post from './Post';
import './css/Feed.css';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [updater, setUpdater] = useContext(updateContext);

    useEffect(() => {
        fetchPosts();
    }, [updater]);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('/api/posts');
            setPosts(response.data); // The posts are already sorted on the server
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(prevPosts => {
            const updatedPosts = prevPosts.map(post => 
                post._id === updatedPost._id ? updatedPost : post
            );
            return updatedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
    };

    const handlePostDelete = (deletedPostId) => {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
    };

    return (
        <div className="feed">
            <CreatePost onPostCreated={handlePostCreated} />
            {posts.map(post => (
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
