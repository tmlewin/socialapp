import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusCircle, Vote, Edit, Trash, Clock, Share2, Copy, Twitter, Facebook } from 'lucide-react';
import axios from '../axios';
import './css/PollsPage.css';
import InfiniteScroll from 'react-infinite-scroll-component';

const PollsPage = () => {
    const [polls, setPolls] = useState([]);
    const [showCreatePoll, setShowCreatePoll] = useState(false);
    const [newPoll, setNewPoll] = useState({
        question: '',
        options: ['', ''],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });
    const [editingPoll, setEditingPoll] = useState(null);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [shareUrl, setShareUrl] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchPolls = useCallback(async (isInitialLoad = false) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/polls?page=${isInitialLoad ? 1 : page}&limit=10`);
            const newPolls = response.data.polls;
            setPolls(prevPolls => isInitialLoad ? newPolls : [...prevPolls, ...newPolls]);
            setHasMore(response.data.hasMore);
            setPage(prevPage => isInitialLoad ? 2 : prevPage + 1);
        } catch (error) {
            console.error('Error fetching polls:', error);
            setError('Failed to fetch polls. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);

        fetchPolls(true);

        return () => {
            // Cleanup function
            setPolls([]);
            setPage(1);
            setHasMore(true);
        };
    }, []);

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/polls', newPoll);
            setPolls([response.data, ...polls]);
            setShowCreatePoll(false);
            setNewPoll({
                question: '',
                options: ['', ''],
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
            });
        } catch (error) {
            console.error('Error creating poll:', error);
            setError('Failed to create poll. Please try again.');
        }
    };

    const handleVote = async (pollId, optionId) => {
        try {
            const response = await axios.put(`/api/polls/${pollId}/vote`, { optionId });
            setPolls(polls.map(poll => poll._id === pollId ? response.data : poll));
        } catch (error) {
            console.error('Error voting:', error);
            setError(error.response?.data?.message || 'Failed to vote. Please try again.');
        }
    };

    const handleEditPoll = async (e) => {
        e.preventDefault();
        try {
            const pollToEdit = {
                ...editingPoll,
                expiresAt: editingPoll.expiresAt ? new Date(editingPoll.expiresAt).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            const response = await axios.put(`/api/polls/${editingPoll._id}`, pollToEdit);
            setPolls(polls.map(poll => poll._id === editingPoll._id ? response.data : poll));
            setEditingPoll(null);
        } catch (error) {
            console.error('Error editing poll:', error);
            setError('Failed to edit poll. Please try again.');
        }
    };

    const handleDeletePoll = async (pollId) => {
        try {
            await axios.delete(`/api/polls/${pollId}`);
            setPolls(polls.filter(poll => poll._id !== pollId));
        } catch (error) {
            console.error('Error deleting poll:', error);
            setError('Failed to delete poll. Please try again.');
        }
    };

    const handleAddOption = () => {
        if (editingPoll) {
            setEditingPoll({ ...editingPoll, options: [...editingPoll.options, { name: '', votes: 0 }] });
        } else {
            setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
        }
    };

    const isPollExpired = (expiresAt) => {
        return new Date() > new Date(expiresAt);
    };

    const handleShare = (pollId) => {
        const url = `${window.location.origin}/polls/${pollId}`;
        setShareUrl(url);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            })
            .catch(err => console.error('Failed to copy: ', err));
    };

    const shareOnTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=Check out this poll!&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank');
    };

    const shareOnFacebook = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank');
    };

    return (
        <div className="polls-page">
            <h1>User Polls</h1>
            {error && <div className="error-message">{error}</div>}
            <button className="create-poll-btn" onClick={() => setShowCreatePoll(!showCreatePoll)}>
                <PlusCircle size={20} />
                Create New Poll
            </button>

            {(showCreatePoll || editingPoll) && (
                <div className="create-poll-form">
                    <h2>{editingPoll ? 'Edit Poll' : 'Create a New Poll'}</h2>
                    <form onSubmit={editingPoll ? handleEditPoll : handleCreatePoll}>
                        <input
                            type="text"
                            placeholder="Enter your question"
                            value={editingPoll ? editingPoll.question : newPoll.question}
                            onChange={(e) => editingPoll ? setEditingPoll({ ...editingPoll, question: e.target.value }) : setNewPoll({ ...newPoll, question: e.target.value })}
                            required
                        />
                        {(editingPoll ? editingPoll.options : newPoll.options).map((option, index) => (
                            <input
                                key={index}
                                type="text"
                                placeholder={`Option ${index + 1}`}
                                value={editingPoll ? option.name : option}
                                onChange={(e) => {
                                    if (editingPoll) {
                                        const newOptions = [...editingPoll.options];
                                        newOptions[index].name = e.target.value;
                                        setEditingPoll({ ...editingPoll, options: newOptions });
                                    } else {
                                        const newOptions = [...newPoll.options];
                                        newOptions[index] = e.target.value;
                                        setNewPoll({ ...newPoll, options: newOptions });
                                    }
                                }}
                                required
                            />
                        ))}
                        <button type="button" onClick={handleAddOption}>Add Option</button>
                        <input
                            type="datetime-local"
                            value={editingPoll ? (editingPoll.expiresAt ? editingPoll.expiresAt.slice(0, 16) : '') : newPoll.expiresAt}
                            onChange={(e) => editingPoll ? setEditingPoll({ ...editingPoll, expiresAt: e.target.value }) : setNewPoll({ ...newPoll, expiresAt: e.target.value })}
                            required
                        />
                        <button type="submit">{editingPoll ? 'Save Changes' : 'Create Poll'}</button>
                        {editingPoll && <button type="button" onClick={() => setEditingPoll(null)}>Cancel</button>}
                    </form>
                </div>
            )}

            {loading && polls.length === 0 ? (
                <div>Loading polls...</div>
            ) : (
                <InfiniteScroll
                    dataLength={polls.length}
                    next={() => fetchPolls(false)}
                    hasMore={hasMore}
                    loader={<h4>Loading more polls...</h4>}
                    endMessage={
                        <p style={{ textAlign: 'center', margin: '20px 0' }}>
                            You have seen all polls
                        </p>
                    }
                >
                    <div className="polls-list">
                        {polls.map((poll) => (
                            <div key={poll._id} className="poll-item">
                                <h2>{poll.question}</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={poll.options}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="votes" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="poll-options">
                                    {!isPollExpired(poll.expiresAt) && poll.options.map((option) => (
                                        <button key={option._id} onClick={() => handleVote(poll._id, option._id)}>
                                            Vote for {option.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="poll-actions">
                                    {currentUser && currentUser._id === poll.createdBy && (
                                        <>
                                            <button onClick={() => setEditingPoll(poll)}><Edit size={16} /> Edit</button>
                                            <button onClick={() => handleDeletePoll(poll._id)}><Trash size={16} /> Delete</button>
                                        </>
                                    )}
                                    <button onClick={() => handleShare(poll._id)}><Share2 size={16} /> Share</button>
                                </div>
                                <div className="poll-stats">
                                    <Vote size={20} />
                                    <span>Total Votes: {poll.options.reduce((sum, option) => sum + option.votes, 0)}</span>
                                    <Clock size={20} />
                                    <span>{isPollExpired(poll.expiresAt) ? 'Expired' : `Expires: ${new Date(poll.expiresAt).toLocaleString()}`}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </InfiniteScroll>
            )}

            {shareUrl && (
                <div className="share-modal">
                    <h3>Share this poll</h3>
                    <div className="share-url">
                        <input type="text" value={shareUrl} readOnly />
                        <button onClick={copyToClipboard}><Copy size={16} /> {copySuccess || 'Copy'}</button>
                    </div>
                    <div className="share-social">
                        <button onClick={shareOnTwitter}><Twitter size={16} /> Share on Twitter</button>
                        <button onClick={shareOnFacebook}><Facebook size={16} /> Share on Facebook</button>
                    </div>
                    <button onClick={() => setShareUrl('')}>Close</button>
                </div>
            )}
        </div>
    );
};

export default PollsPage;
