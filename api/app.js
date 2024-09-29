const express = require('express');
const app = express();
const postsRouter = require('./routes/posts');

// ... other middleware and setup ...

app.use('/api/posts', postsRouter);

// ... rest of your server setup ...