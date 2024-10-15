const express = require('express');
const app = express();
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const path = require('path');
const messagesRoutes = require('./routes/messages');

// ... other middleware

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/messages', messagesRoutes);
// ... other routes

module.exports = app;