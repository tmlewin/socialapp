import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axios';
import Post from './Post';
import CreatePost from './CreatePost';
import './css/ThreadView.css';

const ThreadView = () => {
    const [thread, setThread] = useState(null);
    const [posts, setPosts] = useState([]);
    const { threadId } = useParams();

    useEffect(() => {
        fetchThreadAndPosts();
    }, [threadId]);

    const fetchThreadAndPosts = async () => {
        try {
            const threadResponse = await axios.get(`/api/threads/${threadId}`);
            setThread(threadResponse.data);

            const postsResponse = await axios.get(`/api/threads/${threadId}/posts`);
            setPosts(postsResponse.data);
        } catch (error) {
            console.error('Error fetching thread and posts:', error);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    if (!thread) {
        return <div>Loading...</div>;
    }

    return (
        <div className="thread-view">
            <h1>{thread.title}</h1>
            <p>Created by: {thread.user}</p>
            <CreatePost onPostCreated={handlePostCreated} threadId={threadId} />
            {posts.map(post => (
                <Post key={post._id} post={post} />
            ))}
        </div>
    );
};

export default ThreadView;