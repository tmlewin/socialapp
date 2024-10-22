import React, { useState, useRef, useEffect } from 'react';
import { Inbox, Send, Trash2, Edit, Search, Star, X, Paperclip, File } from 'lucide-react';
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

    useEffect(() => {
        fetchMessages();
        setSelectedMessage(null); // Clear selected message when changing categories
    }, [activeCategory]);

    const fetchMessages = async () => {
        try {
            let response;
            if (activeCategory === 'inbox') {
                response = await axios.get('/api/messages/inbox');
            } else if (activeCategory === 'sent') {
                response = await axios.get('/api/messages/sent');
            }
            console.log(`Fetched ${activeCategory} messages:`, response.data);
            setMessages(response.data);
        } catch (error) {
            console.error(`Error fetching ${activeCategory} messages:`, error);
            setMessages([]); // Set to empty array in case of error
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
                <button className="star-btn" onClick={(e) => {
                    e.stopPropagation();
                    // Implement starring functionality
                }}>
                    <Star size={16} className={message.starred ? 'starred' : ''} />
                </button>
            </div>
        ));
    };

    const handleSelectMessage = async (message) => {
        try {
            const response = await axios.get(`/api/messages/${message._id}`);
            if (!message.read) {
                await axios.put(`/api/messages/${message._id}/read`);
                // Update the message in the local state
                setMessages(messages.map(m => m._id === message._id ? { ...m, read: true } : m));
                // Update notification count
                updateUnreadCount();
            }
            setSelectedMessage(response.data);
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
                    <button className="reply-btn">
                        Reply
                    </button>
                )}
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
            await fetchMessages();
            closeNewMessageModal();
            // Update unread count for the recipient
            if (response.data.recipient !== userId) {
                updateUnreadCount();
            }
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
                        className={`category-btn ${activeCategory === 'trash' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('trash')}
                    >
                        <Trash2 size={18} />
                        Trash
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
        </div>
    );
};

export default Messaging;
