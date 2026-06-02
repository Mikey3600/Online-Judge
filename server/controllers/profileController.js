const User = require('../models/User');
const Solution = require('../models/Solution');
const { sendSuccess, sendError } = require('../utils/response');
const { isValidObjectId } = require('../utils/validation');

const getProfile = async (req, res) => {
    try {
        if (!isValidObjectId(req.user.userId)) {
            return sendError(res, 401, 'Invalid token payload');
        }

        const user = await User.findById(req.user.userId).select('fullName email dob createdAt');
        if (!user) {
            return sendError(res, 404, 'User not found');
        }

        const recentSubmissions = await Solution.find({ user: user._id })
            .sort({ submitted_at: -1 })
            .limit(10)
            .populate('problem', 'name code difficulty');

        const stats = await Solution.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: '$verdict',
                    count: { $sum: 1 },
                    solvedProblems: { $addToSet: '$problem' }
                }
            }
        ]);

        return sendSuccess(res, 200, 'Profile fetched successfully', { user, recentSubmissions, stats });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

module.exports = { getProfile };
