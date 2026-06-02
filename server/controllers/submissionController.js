const Solution = require('../models/Solution');
const TestCase = require('../models/TestCase');
const Problem = require('../models/Problem');
const runCode = require('../executors/runCode');
const { VERDICTS, VERDICT_LABELS } = require('../constants/verdicts');
const { normalizeOutput } = require('../executors/utils/output');
const { sendSuccess, sendError } = require('../utils/response');
const { collectMissingFields, isValidObjectId } = require('../utils/validation');

const judgeSubmission = async (code, testCases) => {
    for (let index = 0; index < testCases.length; index += 1) {
        const testCase = testCases[index];
        const result = await runCode(code, testCase.input);

        if (result.verdict !== VERDICTS.ACCEPTED) {
            return {
                verdict: result.verdict,
                failedTestCase: index + 1,
                output: result.output,
                error: result.error
            };
        }

        if (normalizeOutput(result.output) !== normalizeOutput(testCase.output)) {
            return {
                verdict: VERDICTS.WRONG_ANSWER,
                failedTestCase: index + 1,
                output: result.output,
                expected: testCase.output,
                error: ''
            };
        }
    }

    return {
        verdict: VERDICTS.ACCEPTED,
        failedTestCase: null,
        output: '',
        error: ''
    };
};

const submitCode = async (req, res) => {
    try {
        const missing = collectMissingFields(req.body, ['problemId', 'code']);
        if (missing.length > 0) {
            return sendError(res, 400, 'Missing required fields', { fields: missing });
        }

        const { problemId, code } = req.body;
        const userId = req.user.userId;

        if (!isValidObjectId(problemId)) {
            return sendError(res, 400, 'Invalid problem id');
        }
        if (typeof code !== 'string' || code.trim().length === 0) {
            return sendError(res, 400, 'Code must be a non-empty string');
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return sendError(res, 404, 'Problem not found');
        }

        const testCases = await TestCase.find({ problem: problemId }).sort({ _id: 1 });
        if (testCases.length === 0) {
            return sendError(res, 400, 'No test cases found for this problem');
        }

        const judgeResult = await judgeSubmission(code, testCases);
        const solution = await Solution.create({
            problem: problemId,
            user: userId,
            verdict: judgeResult.verdict
        });

        return sendSuccess(res, 200, 'Submission judged', {
            verdict: judgeResult.verdict,
            verdictLabel: VERDICT_LABELS[judgeResult.verdict],
            solutionId: solution._id,
            failedTestCase: judgeResult.failedTestCase,
            error: judgeResult.error || undefined
        });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

module.exports = { submitCode, judgeSubmission };
