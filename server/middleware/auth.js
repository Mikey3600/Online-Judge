const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const extractBearerToken = (authorizationHeader = '') => {
    const [scheme, token] = authorizationHeader.split(' ');
    return scheme && scheme.toLowerCase() === 'bearer' ? token : null;
};

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token || extractBearerToken(req.headers.authorization);

    if (!token) {
        return sendError(res, 401, 'Access denied. No token provided.');
    }

    if (!process.env.JWT_SECRET) {
        return sendError(res, 500, 'JWT_SECRET is not configured');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            return sendError(res, 401, 'Invalid token payload');
        }
        req.user = decoded;
        return next();
    } catch (err) {
        return sendError(res, 401, 'Invalid or expired token');
    }
};

module.exports = verifyToken;
module.exports.extractBearerToken = extractBearerToken;
