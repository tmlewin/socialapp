const express = require('express');
const app = express();
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
// ... other imports

// ... other middleware

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
// ... other routes

module.exports = app;