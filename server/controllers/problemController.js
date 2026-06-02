const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const { sendSuccess, sendError } = require('../utils/response');
const { collectMissingFields, isValidObjectId, normalizeString } = require('../utils/validation');

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const buildProblemPayload = (body, partial = false) => {
    const payload = {};

    ['name', 'statement', 'code', 'difficulty'].forEach((field) => {
        if (body[field] !== undefined) {
            payload[field] = field === 'code' ? normalizeString(body[field]).toUpperCase() : normalizeString(body[field]);
        }
    });

    if (!partial) {
        const missing = collectMissingFields(payload, ['name', 'statement', 'code']);
        if (missing.length > 0) return { error: { message: 'Missing required fields', details: { fields: missing } } };
    }

    if (payload.difficulty && !VALID_DIFFICULTIES.includes(payload.difficulty)) {
        return { error: { message: 'Invalid difficulty', details: { allowed: VALID_DIFFICULTIES } } };
    }

    return { payload };
};

const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}, 'name code difficulty').sort({ code: 1 });
        return sendSuccess(res, 200, 'Problems fetched successfully', { problems });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

const getProblemById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return sendError(res, 400, 'Invalid problem id');
        }

        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return sendError(res, 404, 'Problem not found');
        }
        return sendSuccess(res, 200, 'Problem fetched successfully', { problem });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

const createProblem = async (req, res) => {
    try {
        const { payload, error } = buildProblemPayload(req.body);
        if (error) return sendError(res, 400, error.message, error.details);

        const existing = await Problem.findOne({ code: payload.code });
        if (existing) {
            return sendError(res, 409, 'Problem code already exists');
        }

        const problem = await Problem.create(payload);
        return sendSuccess(res, 201, 'Problem created', { problem });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

const updateProblem = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return sendError(res, 400, 'Invalid problem id');
        }

        const { payload, error } = buildProblemPayload(req.body, true);
        if (error) return sendError(res, 400, error.message, error.details);
        if (Object.keys(payload).length === 0) {
            return sendError(res, 400, 'No valid fields supplied for update');
        }

        if (payload.code) {
            const duplicate = await Problem.findOne({ code: payload.code, _id: { $ne: req.params.id } });
            if (duplicate) return sendError(res, 409, 'Problem code already exists');
        }

        const problem = await Problem.findByIdAndUpdate(req.params.id, payload, {
            new: true,
            runValidators: true
        });
        if (!problem) {
            return sendError(res, 404, 'Problem not found');
        }
        return sendSuccess(res, 200, 'Problem updated', { problem });
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

const deleteProblem = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return sendError(res, 400, 'Invalid problem id');
        }

        const problem = await Problem.findByIdAndDelete(req.params.id);
        if (!problem) {
            return sendError(res, 404, 'Problem not found');
        }

        await TestCase.deleteMany({ problem: problem._id });
        return sendSuccess(res, 200, 'Problem deleted');
    } catch (err) {
        return sendError(res, 500, 'Server error', err.message);
    }
};

module.exports = { getAllProblems, getProblemById, createProblem, updateProblem, deleteProblem };
