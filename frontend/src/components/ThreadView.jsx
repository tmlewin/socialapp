import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axios';
import Post from './Post';
import CreatePost from './CreatePost';
import './css/ThreadView.css';

const ThreadView = () => {
    const [thread, setThread] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { threadId } = useParams();

    useEffect(() => {
        const fetchThreadAndPosts = async () => {
            try {
                const [threadResponse, postsResponse] = await Promise.all([
                    axios.get(`/api/threads/${threadId}`),
                    axios.get(`/api/threads/${threadId}/posts`)
                ]);
                setThread(threadResponse.data);
                setPosts(postsResponse.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching thread and posts:', err);
                setError('Failed to load thread and posts. Please try again later.');
                setLoading(false);
            }
        };

        fetchThreadAndPosts();
    }, [threadId]);

    const handlePostCreated = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!thread) return <div>Thread not found</div>;

    return (
        <div className="thread-view">
            <h1>{thread.title}</h1>
            <p>Created by: {thread.user}</p>
            <CreatePost onPostCreated={handlePostCreated} threadId={threadId} />
            {posts.length === 0 ? (
                <p>No posts in this thread yet. Be the first to post!</p>
            ) : (
                posts.map(post => (
                    <Post key={post._id} post={post} />
                ))
            )}
        </div>
    );
};

export default ThreadView;