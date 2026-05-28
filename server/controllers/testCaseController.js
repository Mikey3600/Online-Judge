const TestCase = require('../models/TestCase');

// Add test case to a problem
const addTestCase = async (req, res) => {
    try {
        const { input, output, problem } = req.body;
        const testCase = await TestCase.create({ input, output, problem });
        res.status(201).json({ message: 'Test case added', testCase });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all test cases for a problem
const getTestCases = async (req, res) => {
    try {
        const testCases = await TestCase.find({ problem: req.params.problemId });
        res.status(200).json(testCases);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete test case
const deleteTestCase = async (req, res) => {
    try {
        await TestCase.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Test case deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { addTestCase, getTestCases, deleteTestCase };