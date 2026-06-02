const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/response');
const { collectMissingFields, normalizeString } = require('../utils/validation');
const { getAuthCookieOptions, getClearCookieOptions } = require('../utils/cookies');

const createToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const toPublicUser = (user) => ({
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    dob: user.dob
});

const register = async (req, res) => {
    try {
        const missing = collectMissingFields(req.body, ['fullName', 'email', 'password']);
        if (missing.length > 0) {
            return sendError(res, 400, 'Missing required fields', { fields: missing });
        }

        const fullName = normalizeString(req.body.fullName);
        const email = normalizeString(req.body.email).toLowerCase();
        const { password, dob } = req.body;

        if (password.length < 6) {
            return sendError(res, 400, 'Password must be at least 6 characters long');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 409, 'Email already registered');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            dob
        });

        const token = createToken(user);
        res.cookie('token', token, getAuthCookieOptions());

        return sendSuccess(res, 201, 'User registered successfully', { user: toPublicUser(user) });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

const login = async (req, res) => {
    try {
        const missing = collectMissingFields(req.body, ['email', 'password']);
        if (missing.length > 0) {
            return sendError(res, 400, 'Missing required fields', { fields: missing });
        }

        const email = normalizeString(req.body.email).toLowerCase();
        const { password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 401, 'Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid credentials');
        }

        const token = createToken(user);
        res.cookie('token', token, getAuthCookieOptions());

        return sendSuccess(res, 200, 'Login successful', { user: toPublicUser(user) });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

const logout = (req, res) => {
    res.clearCookie('token', getClearCookieOptions());
    return sendSuccess(res, 200, 'Logged out successfully');
};

module.exports = { register, login, logout, createToken, toPublicUser };
