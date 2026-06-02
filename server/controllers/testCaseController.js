const TestCase = require('../models/TestCase');
const Problem = require('../models/Problem');
const { sendSuccess, sendError } = require('../utils/response');
const { collectMissingFields, isValidObjectId } = require('../utils/validation');

const resolveProblemId = (body) => body.problem || body.problemId;

const addTestCase = async (req, res) => {
    try {
        const problemId = resolveProblemId(req.body);
        const missing = collectMissingFields({ ...req.body, problem: problemId }, ['input', 'output', 'problem']);
        if (missing.length > 0) {
            return sendError(res, 400, 'Missing required fields', { fields: missing });
        }
        if (!isValidObjectId(problemId)) {
            return sendError(res, 400, 'Invalid problem id');
        }

        const problem = await Problem.findById(problemId);
        if (!problem) return sendError(res, 404, 'Problem not found');

        const testCase = await TestCase.create({
            input: req.body.input,
            output: req.body.output,
            problem: problemId
        });
        return sendSuccess(res, 201, 'Test case added', { testCase });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

const getTestCases = async (req, res) => {
    try {
        const { problemId } = req.params;
        if (!isValidObjectId(problemId)) {
            return sendError(res, 400, 'Invalid problem id');
        }

        const problem = await Problem.findById(problemId);
        if (!problem) return sendError(res, 404, 'Problem not found');

        const testCases = await TestCase.find({ problem: problemId }).sort({ _id: 1 });
        return sendSuccess(res, 200, 'Test cases fetched successfully', { testCases });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

const updateTestCase = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return sendError(res, 400, 'Invalid test case id');
        }

        const payload = {};
        if (req.body.input !== undefined) payload.input = req.body.input;
        if (req.body.output !== undefined) payload.output = req.body.output;
        if (resolveProblemId(req.body) !== undefined) payload.problem = resolveProblemId(req.body);

        if (Object.keys(payload).length === 0) {
            return sendError(res, 400, 'No valid fields supplied for update');
        }

        if (payload.problem) {
            if (!isValidObjectId(payload.problem)) return sendError(res, 400, 'Invalid problem id');
            const problem = await Problem.findById(payload.problem);
            if (!problem) return sendError(res, 404, 'Problem not found');
        }

        const testCase = await TestCase.findByIdAndUpdate(req.params.id, payload, {
            new: true,
            runValidators: true
        });
        if (!testCase) return sendError(res, 404, 'Test case not found');

        return sendSuccess(res, 200, 'Test case updated', { testCase });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

const deleteTestCase = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return sendError(res, 400, 'Invalid test case id');
        }

        const testCase = await TestCase.findByIdAndDelete(req.params.id);
        if (!testCase) return sendError(res, 404, 'Test case not found');

        return sendSuccess(res, 200, 'Test case deleted');
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

module.exports = { addTestCase, getTestCases, updateTestCase, deleteTestCase };
