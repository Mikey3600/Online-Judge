const Solution = require('../models/Solution');

const getLeaderboard = async (req, res) => {
    try {
        const solutions = await Solution.find()
            .sort({ submitted_at: -1 })    // newest first
            .limit(10)                      // last 10 only
            .populate('user', 'fullName email')    // get user details
            .populate('problem', 'name code');     // get problem details

        res.status(200).json(solutions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { getLeaderboard };