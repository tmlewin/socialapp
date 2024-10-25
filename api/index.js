require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const threadRoutes = require('./routes/threads');
const profileRoutes = require('./routes/profile');
const usersRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const pollsRoutes = require('./routes/polls');
const activityRoutes = require('./routes/activity');
const { router: achievementsRoutes } = require('./routes/achievements');
const messagesRoutes = require('./routes/messages');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/users/activity', activityRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/messages', messagesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
