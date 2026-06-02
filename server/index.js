const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const testCaseRoutes = require('./routes/testCases');
const leaderboardRoutes = require('./routes/leaderboard');
const solutionRoutes = require('./routes/solutions');
const profileRoutes = require('./routes/profile');
const submitRoutes = require('./routes/submit');
const { sendSuccess, sendError } = require('./utils/response');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());

app.get('/', (req, res) => sendSuccess(res, 200, 'Online Judge API is running'));
app.get('/api/health', (req, res) => sendSuccess(res, 200, 'Backend health check passed', {
    service: 'online-judge-api',
    timestamp: new Date().toISOString()
}));

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/testcases', testCaseRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/submit', submitRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/profile', profileRoutes);

app.use((req, res) => sendError(res, 404, 'Route not found'));

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return sendError(res, 400, 'Invalid JSON body');
    }
    return sendError(res, 500, 'Server error', err.message);
});

const startServer = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not configured');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.log('Server startup error:', err.message);
        process.exitCode = 1;
    }
};

if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
