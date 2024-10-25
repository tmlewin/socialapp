import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from '../axios';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const updateUnreadCount = useCallback(async () => {
        try {
            const response = await axios.get('/api/messages/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread message count:', error);
        }
    }, []);

    return (
        <NotificationContext.Provider value={{ unreadCount, updateUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};
