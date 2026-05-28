const Problem = require('../models/Problem');

// GET all problems
const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}, 'name code difficulty');
        res.status(200).json(problems);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET single problem by ID
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json(problem);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST create problem (admin only)
const createProblem = async (req, res) => {
    try {
        const { name, statement, code, difficulty } = req.body;

        const existing = await Problem.findOne({ code });
        if (existing) {
            return res.status(400).json({ message: 'Problem code already exists' });
        }

        const problem = await Problem.create({ name, statement, code, difficulty });
        res.status(201).json({ message: 'Problem created', problem });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT update problem
const updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }   // returns updated document
        );
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json({ message: 'Problem updated', problem });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// DELETE problem
const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json({ message: 'Problem deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { getAllProblems, getProblemById, createProblem, updateProblem, deleteProblem };