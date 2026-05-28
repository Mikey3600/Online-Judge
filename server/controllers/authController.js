const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
const register = async (req, res) => {
    try {
        const { fullName, email, password, dob } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            dob
        });

        // Sign JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,        // set true in production (HTTPS)
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days in ms
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Sign JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// LOGOUT
const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { register, login, logout };