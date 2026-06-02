const User = require('../models/User');
const Solution = require('../models/Solution');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('fullName email dob');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const recentSubmissions = await Solution.find({ user: user._id })
            .sort({ submitted_at: -1 })
            .limit(10)
            .populate('problem', 'name code difficulty');

        res.status(200).json({ user, recentSubmissions });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { getProfile };
