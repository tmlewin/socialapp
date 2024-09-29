require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bp = require('body-parser');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const threadRoutes = require('./routes/threads');
const profileRoutes = require('./routes/profile');
const connectDB = require('./config/db');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/users', profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

