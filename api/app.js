const express = require('express');
const app = express();
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const path = require('path');
const messagesRouter = require('./routes/messages');
const cors = require('cors');

// Add CORS middleware before other middleware and routes
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add this line for request logging
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Make sure you have body-parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... other middleware

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

// Add this line before using the messagesRouter
console.log('Setting up /api/messages route');
app.use('/api/messages', (req, res, next) => {
  console.log('Received request to /api/messages');
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);
  next();
}, messagesRouter);

// Add this catch-all route at the end
app.use('*', (req, res) => {
  console.log(`No route found for ${req.method} ${req.path}`);
  res.status(404).send('Not Found');
});

// ... other routes

module.exports = app;
