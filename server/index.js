const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/auth');


// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Online Judge API is running' });
});

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((err) => console.log('DB connection error:', err));