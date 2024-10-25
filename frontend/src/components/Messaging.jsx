import React, { useState, useRef, useEffect } from 'react';
import { Inbox, Send, Trash2, Edit, Search, Star, X, Paperclip, File, Archive } from 'lucide-react';
import './css/Messaging.css';
import axios from '../axios';
import { useNotification } from '../context/NotificationContext';

const Messaging = ({ userId }) => {
    const { updateUnreadCount } = useNotification();
    const [activeCategory, setActiveCategory] = useState('inbox');
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [newMessage, setNewMessage] = useState({ to: '', subject: '', content: '', attachment: null });
    const fileInputRef = useRef(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyMessage, setReplyMessage] = useState({ content: '', attachment: null });
    const [threadMessages, setThreadMessages] = useState([]);
    const [showQuickReplyOptions, setShowQuickReplyOptions] = useState(false);
    const [customQuickReply, setCustomQuickReply] = useState('');
    const [isThreadCollapsed, setIsThreadCollapsed] = useState(false);

    useEffect(() => {
        fetchMessages();
        setSelectedMessage(null);
    }, [activeCategory]);

    const fetchMessages = async () => {
        try {
            let response;
            if (activeCategory === 'inbox') {
                response = await axios.get('/api/messages/inbox');
            } else if (activeCategory === 'sent') {
                response = await axios.get('/api/messages/sent');
            } else if (activeCategory === 'drafts') {
                response = await axios.get('/api/messages/drafts');
            }
            console.log(`Fetched ${activeCategory} messages:`, response.data);
            setMessages(response.data);
        } catch (error) {
            console.error(`Error fetching ${activeCategory} messages:`, error);
            setMessages([]);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            if (activeCategory === 'drafts') {
                await axios.delete(`/api/messages/${messageId}`);
            } else {
                await axios.put(`/api/messages/${messageId}/draft`);
            }
            setMessages(messages.filter(m => m._id !== messageId));
            setSelectedMessage(null);
            // Fetch messages again to update the current category
            fetchMessages();
        } catch (error) {
            console.error('Error deleting/moving message:', error);
            alert('Failed to delete/move message. Please try again.');
        }
    };

    const handleRestoreMessage = async (messageId) => {
        try {
            await axios.put(`/api/messages/${messageId}/restore`);
            setMessages(messages.filter(m => m._id !== messageId));
            setSelectedMessage(null);
        } catch (error) {
            console.error('Error restoring message:', error);
            alert('Failed to restore message. Please try again.');
        }
    };

    const filteredMessages = messages.filter(message => {
        const searchableText = activeCategory === 'inbox'
            ? `${message.sender.username} ${message.subject} ${message.content}`
            : `${message.recipient.username} ${message.subject} ${message.content}`;
        return searchableText.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const renderMessageList = () => {
        if (filteredMessages.length === 0) {
            return <div className="no-messages">No messages in {activeCategory}</div>;
        }

        return filteredMessages.map(message => (
            <div 
                key={message._id} 
                className={`message-item ${!message.read ? 'unread' : ''} ${message.starred ? 'starred' : ''} ${selectedMessage && selectedMessage._id === message._id ? 'selected' : ''}`}
                onClick={() => handleSelectMessage(message)}
            >
                <div className="message-item-content">
                    <div className="message-header">
                        <span className="message-from">
                            {activeCategory === 'inbox' ? message.sender.username : message.recipient.username}
                        </span>
                        <span className="message-date">{new Date(message.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="message-subject">{message.subject}</div>
                    <div className="message-preview">{message.content}</div>
                </div>
                <div className="message-actions">
                    <button className="star-btn" onClick={(e) => {
                        e.stopPropagation();
                        // Implement starring functionality
                    }}>
                        <Star size={16} className={message.starred ? 'starred' : ''} />
                    </button>
                    {activeCategory === 'drafts' ? (
                        <button className="restore-btn" onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreMessage(message._id);
                        }}>
                            <Archive size={16} />
                        </button>
                    ) : null}
                    <button className="delete-btn" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(message._id);
                    }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        ));
    };

    const handleSelectMessage = async (message) => {
        try {
            const response = await axios.get(`/api/messages/${message._id}`);
            
            // Only mark as read if it's an inbox message and unread
            if (activeCategory === 'inbox' && !message.read) {
                await axios.put(`/api/messages/${message._id}/read`);
                // Update the message in the local state
                setMessages(messages.map(m => m._id === message._id ? { ...m, read: true } : m));
                // Update notification count
                updateUnreadCount();
            }
            
            setSelectedMessage(response.data);
            // Fetch thread messages when selecting a message
            await fetchThreadMessages(response.data.threadId || response.data._id);
        } catch (error) {
            console.error('Error fetching message details:', error);
            alert('Failed to load message details. Please try again.');
        }
    };

    const handleDownloadAttachment = async (messageId, filename) => {
        try {
            const response = await axios.get(`/api/messages/${messageId}/attachment`, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/octet-stream'
                }
            });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading attachment:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            alert('Failed to download attachment. Please try again.');
        }
    };

    const renderMessageDetail = () => {
        if (!selectedMessage) return null;
        return (
            <div className="message-detail">
                <h3>{selectedMessage.subject}</h3>
                <div className="message-info">
                    <span>From: {activeCategory === 'inbox' ? selectedMessage.sender.username : 'You'}</span>
                    <span>To: {activeCategory === 'inbox' ? 'You' : selectedMessage.recipient.username}</span>
                    <span>Date: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
                <div className="message-content">{selectedMessage.content}</div>
                {selectedMessage.attachment && (
                    <div className="attachment">
                        <strong>Attachment:</strong> 
                        <button 
                            onClick={() => handleDownloadAttachment(selectedMessage._id, selectedMessage.attachment.filename)}
                            className="download-btn"
                        >
                            <File size={16} />
                            {selectedMessage.attachment.filename}
                        </button>
                    </div>
                )}
                {activeCategory === 'inbox' && (
                    <div className="message-actions">
                        <button className="reply-btn" onClick={() => setShowReplyModal(true)}>
                            Reply
                        </button>
                        <button 
                            className="quick-reply-btn"
                            onClick={() => setShowQuickReplyOptions(!showQuickReplyOptions)}
                        >
                            Quick Reply
                        </button>
                    </div>
                )}
                {renderQuickReplyOptions()}
                {renderThreadView()}
            </div>
        );
    };

    const handleNewMessage = () => {
        setShowNewMessageModal(true);
    };

    const closeNewMessageModal = () => {
        setShowNewMessageModal(false);
        setNewMessage({ to: '', subject: '', content: '', attachment: null });
    };

    const handleNewMessageChange = (e) => {
        const { name, value } = e.target;
        setNewMessage(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit.');
                return;
            }
            setNewMessage(prev => ({ ...prev, attachment: file }));
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const renderAttachmentPreview = () => {
        if (!newMessage.attachment) return null;

        const isImage = newMessage.attachment.type.startsWith('image/');
        return (
            <div className="attachment-preview">
                {isImage ? (
                    <img src={URL.createObjectURL(newMessage.attachment)} alt="Attachment preview" />
                ) : (
                    <div className="file-preview">
                        <File size={24} />
                        <span>{newMessage.attachment.name}</span>
                    </div>
                )}
                <button onClick={() => setNewMessage(prev => ({ ...prev, attachment: null }))}>Remove</button>
            </div>
        );
    };

    const sendNewMessage = async () => {
        try {
            const formData = new FormData();
            formData.append('recipient', newMessage.to);
            formData.append('subject', newMessage.subject);
            formData.append('content', newMessage.content);
            if (newMessage.attachment) {
                formData.append('attachment', newMessage.attachment);
            }

            const response = await axios.post('/api/messages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Message sent successfully:', response.data);
            await fetchMessages(); // This will update the current category (inbox, sent, or drafts)
            if (activeCategory === 'sent') {
                setActiveCategory('sent'); // This will trigger a re-fetch of sent messages
            }
            closeNewMessageModal();
            
            // Ensure notification count is updated after sending a message
            updateUnreadCount();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const renderNewMessageModal = () => {
        if (!showNewMessageModal) return null;
        return (
            <div className="new-message-modal">
                <div className="new-message-content">
                    <div className="new-message-header">
                        <h3>New Message</h3>
                        <button onClick={closeNewMessageModal} className="close-btn">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="new-message-form">
                        <input
                            type="text"
                            name="to"
                            placeholder="To"
                            value={newMessage.to}
                            onChange={handleNewMessageChange}
                        />
                        <input
                            type="text"
                            name="subject"
                            placeholder="Subject"
                            value={newMessage.subject}
                            onChange={handleNewMessageChange}
                        />
                        <textarea
                            name="content"
                            placeholder="Message"
                            value={newMessage.content}
                            onChange={handleNewMessageChange}
                        />
                        <div className="attachment-section">
                            <button onClick={triggerFileInput} className="attachment-btn">
                                <Paperclip size={18} />
                                Attach File
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            {renderAttachmentPreview()}
                        </div>
                        <button onClick={sendNewMessage} className="send-btn">Send</button>
                    </div>
                </div>
            </div>
        );
    };

    const handleReplySubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('content', replyMessage.content);
            if (replyMessage.attachment) {
                formData.append('attachment', replyMessage.attachment);
            }

            const response = await axios.post(
                `/api/messages/${selectedMessage._id}/reply`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Fetch updated thread messages
            await fetchThreadMessages(selectedMessage.threadId || selectedMessage._id);
            
            // Close modal and reset form
            setShowReplyModal(false);
            setReplyMessage({ content: '', attachment: null });
            
            // Update message list
            fetchMessages();
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Failed to send reply. Please try again.');
        }
    };

    const fetchThreadMessages = async (threadId) => {
        try {
            const response = await axios.get(`/api/messages/${threadId}/thread`);
            setThreadMessages(response.data);
        } catch (error) {
            console.error('Error fetching thread messages:', error);
        }
    };

    const renderReplyModal = () => {
        if (!showReplyModal || !selectedMessage) return null;
        return (
            <div className="reply-modal">
                <div className="reply-content">
                    <div className="new-message-header">
                        <h3>Reply to Message</h3>
                        <button onClick={() => setShowReplyModal(false)} className="close-btn">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="quoted-message">
                        <strong>{selectedMessage.sender.username} wrote:</strong>
                        <p>{selectedMessage.content}</p>
                    </div>
                    <div className="new-message-form">
                        <textarea
                            name="content"
                            placeholder="Write your reply..."
                            value={replyMessage.content}
                            onChange={(e) => setReplyMessage(prev => ({ ...prev, content: e.target.value }))}
                        />
                        <div className="attachment-section">
                            <button onClick={triggerFileInput} className="attachment-btn">
                                <Paperclip size={18} />
                                Attach File
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) setReplyMessage(prev => ({ ...prev, attachment: file }));
                                }}
                                style={{ display: 'none' }}
                            />
                            {replyMessage.attachment && (
                                <div className="attachment-preview">
                                    <File size={24} />
                                    <span>{replyMessage.attachment.name}</span>
                                    <button onClick={() => setReplyMessage(prev => ({ ...prev, attachment: null }))}>
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                        <button onClick={handleReplySubmit} className="send-btn">Send Reply</button>
                    </div>
                </div>
            </div>
        );
    };

    const handleQuickReply = async (type) => {
        try {
            const payload = {
                type,
                customMessage: type === 'custom' ? customQuickReply : undefined
            };

            await axios.post(`/api/messages/${selectedMessage._id}/quick-reply`, payload);
            
            // Refresh thread messages
            await fetchThreadMessages(selectedMessage.threadId || selectedMessage._id);
            
            // Close quick reply options
            setShowQuickReplyOptions(false);
            setCustomQuickReply('');
            
            // Update message list
            fetchMessages();
        } catch (error) {
            console.error('Error sending quick reply:', error);
            alert('Failed to send quick reply. Please try again.');
        }
    };

    const renderQuickReplyOptions = () => {
        if (!showQuickReplyOptions) return null;
        
        return (
            <div className="quick-reply-options">
                <button onClick={() => handleQuickReply('acknowledge')}>
                    Acknowledge
                </button>
                <button onClick={() => handleQuickReply('approve')}>
                    Approve
                </button>
                <button onClick={() => handleQuickReply('reject')}>
                    Reject
                </button>
                <div className="custom-quick-reply">
                    <input
                        type="text"
                        value={customQuickReply}
                        onChange={(e) => setCustomQuickReply(e.target.value)}
                        placeholder="Custom quick reply..."
                    />
                    <button 
                        onClick={() => handleQuickReply('custom')}
                        disabled={!customQuickReply.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        );
    };

    const renderThreadView = () => {
        if (!threadMessages.length) return null;

        return (
            <div className="thread-view">
                <div className="thread-header">
                    <h4>Message Thread ({threadMessages.length})</h4>
                    <button 
                        className="toggle-thread-btn"
                        onClick={() => setIsThreadCollapsed(!isThreadCollapsed)}
                    >
                        {isThreadCollapsed ? 'Expand' : 'Collapse'}
                    </button>
                </div>
                
                {!isThreadCollapsed && (
                    <div className="thread-messages">
                        {threadMessages.map((msg, index) => (
                            <div 
                                key={msg._id} 
                                className={`thread-message ${msg._id === selectedMessage._id ? 'current' : ''}`}
                            >
                                <div className="thread-message-header">
                                    <strong>{msg.sender.username}</strong>
                                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="message-content">
                                    {msg.content}
                                </div>
                                {msg.isQuickReply && (
                                    <div className="quick-reply-badge">
                                        Quick Reply: {msg.quickReplyType}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="messaging-container">
            <div className="messaging-sidebar">
                <button className="new-message-btn" onClick={handleNewMessage}>
                    <Edit size={18} />
                    New Message
                </button>
                <div className="message-categories">
                    <button
                        className={`category-btn ${activeCategory === 'inbox' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('inbox')}
                    >
                        <Inbox size={18} />
                        Inbox
                    </button>
                    <button
                        className={`category-btn ${activeCategory === 'sent' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('sent')}
                    >
                        <Send size={18} />
                        Sent
                    </button>
                    <button
                        className={`category-btn ${activeCategory === 'drafts' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('drafts')}
                    >
                        <Archive size={18} />
                        Drafts
                    </button>
                </div>
            </div>
            <div className="messaging-content">
                <div className="messaging-header">
                    <h2>{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</h2>
                    <div className="search-bar">
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={18} />
                    </div>
                </div>
                <div className="message-list-container">
                    <div className="message-list">
                        {renderMessageList()}
                    </div>
                    <div className="message-detail-container">
                        {renderMessageDetail()}
                    </div>
                </div>
            </div>
            {renderNewMessageModal()}
            {renderReplyModal()}
        </div>
    );
};

export default Messaging;
