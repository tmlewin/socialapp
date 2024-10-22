import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Vote, Clock } from 'lucide-react';
import axios from '../axios';
import './css/PollsPage.css';

const PollView = () => {
    const { pollId } = useParams();
    const [poll, setPoll] = useState(null);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const response = await axios.get(`/api/polls/${pollId}`);
                setPoll(response.data);
            } catch (error) {
                console.error('Error fetching poll:', error);
                setError('Failed to fetch poll. Please try again.');
            }
        };

        fetchPoll();
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
    }, [pollId]);

    const handleVote = async (optionId) => {
        try {
            const response = await axios.put(`/api/polls/${pollId}/vote`, { optionId });
            setPoll(response.data);
        } catch (error) {
            console.error('Error voting:', error);
            setError(error.response?.data?.message || 'Failed to vote. Please try again.');
        }
    };

    const isPollExpired = (expiresAt) => {
        return new Date() > new Date(expiresAt);
    };

    if (!poll) return <div className="polls-page">Loading...</div>;
    if (error) return <div className="polls-page error-message">{error}</div>;

    return (
        <div className="polls-page">
            <h1>Poll Details</h1>
            <div className="poll-item">
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
                        <button key={option._id} onClick={() => handleVote(option._id)}>
                            Vote for {option.name}
                        </button>
                    ))}
                </div>
                <div className="poll-stats">
                    <Vote size={20} />
                    <span>Total Votes: {poll.options.reduce((sum, option) => sum + option.votes, 0)}</span>
                    <Clock size={20} />
                    <span>{isPollExpired(poll.expiresAt) ? 'Expired' : `Expires: ${new Date(poll.expiresAt).toLocaleString()}`}</span>
                </div>
            </div>
        </div>
    );
};

export default PollView;
