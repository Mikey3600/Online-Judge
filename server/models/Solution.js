const mongoose = require('mongoose');
const { VERDICTS } = require('../constants/verdicts');

const solutionSchema = new mongoose.Schema({
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verdict: {
        type: String,
        enum: Object.values(VERDICTS),
        required: true
    },
    submitted_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Solution', solutionSchema);
