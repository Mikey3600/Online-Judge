const Solution = require('../models/Solution');
const TestCase = require('../models/TestCase');
const Problem = require('../models/Problem');
const runCode = require('../executors/runCode');
const { VERDICTS, VERDICT_LABELS } = require('../constants/verdicts');
const { normalizeOutput } = require('../executors/utils/output');

const judgeSubmission = async (code, testCases) => {
    for (const testCase of testCases) {
        const result = await runCode(code, testCase.input);

        if (result.verdict !== VERDICTS.ACCEPTED) {
            return {
                verdict: result.verdict,
                output: result.output,
                error: result.error
            };
        }

        if (normalizeOutput(result.output) !== normalizeOutput(testCase.output)) {
            return {
                verdict: VERDICTS.WRONG_ANSWER,
                output: result.output,
                error: ''
            };
        }
    }

    return {
        verdict: VERDICTS.ACCEPTED,
        output: '',
        error: ''
    };
};

const submitCode = async (req, res) => {
    try {
        const { problemId, code } = req.body;
        const userId = req.user.userId;

        if (!problemId || !code) {
            return res.status(400).json({ message: 'problemId and code are required' });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const testCases = await TestCase.find({ problem: problemId }).sort({ _id: 1 });
        if (testCases.length === 0) {
            return res.status(400).json({ message: 'No test cases found for this problem' });
        }

        const judgeResult = await judgeSubmission(code, testCases);
        const solution = await Solution.create({
            problem: problemId,
            user: userId,
            verdict: judgeResult.verdict
        });

        res.status(200).json({
            verdict: judgeResult.verdict,
            verdictLabel: VERDICT_LABELS[judgeResult.verdict],
            solutionId: solution._id,
            error: judgeResult.error || undefined
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { submitCode, judgeSubmission };
