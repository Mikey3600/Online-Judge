const Solution = require('../models/Solution');
const { VERDICTS } = require('../constants/verdicts');
const { sendSuccess, sendError } = require('../utils/response');

const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Solution.aggregate([
            { $match: { verdict: VERDICTS.ACCEPTED } },
            {
                $group: {
                    _id: '$user',
                    acceptedSubmissions: { $sum: 1 },
                    solvedProblems: { $addToSet: '$problem' },
                    lastAcceptedAt: { $max: '$submitted_at' }
                }
            },
            {
                $project: {
                    user: '$_id',
                    _id: 0,
                    acceptedSubmissions: 1,
                    solvedCount: { $size: '$solvedProblems' },
                    lastAcceptedAt: 1
                }
            },
            { $sort: { solvedCount: -1, acceptedSubmissions: -1, lastAcceptedAt: 1 } },
            { $limit: 10 }
        ]);

        await Solution.populate(leaderboard, { path: 'user', select: 'fullName email' });
        return sendSuccess(res, 200, 'Leaderboard fetched successfully', { leaderboard });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

module.exports = { getLeaderboard };
