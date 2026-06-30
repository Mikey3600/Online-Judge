const Solution = require('../models/Solution');
const TestCase = require('../models/TestCase');
const Problem = require('../models/Problem');
const runCode = require('../executors/runCode');

const submitCode = async (req, res) => {
    try {
        const { problemId, code } = req.body;
        const userId = req.user.userId;

        // Fetch problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Fetch test cases
        const testCases = await TestCase.find({ problem: problemId });
        if (testCases.length === 0) {
            return res.status(400).json({ message: 'No test cases found for this problem' });
        }

        // Run code against each test case
        let verdict = 'Accepted';

        for (let tc of testCases) {
            const result = await runCode(code, tc.input);

            if (result.verdict === 'Compilation Error') {
                verdict = 'Compilation Error';
                break;
            }
            if (result.verdict === 'Time Limit Exceeded') {
                verdict = 'Time Limit Exceeded';
                break;
            }
            if (result.verdict === 'Runtime Error') {
                verdict = 'Runtime Error';
                break;
            }
            if (result.output !== tc.output.trim()) {
                verdict = 'Wrong Answer';
                break;
            }
        }

        // Save to DB
        const solution = await Solution.create({
            problem: problemId,
            user: userId,
            verdict
        });

        res.status(200).json({ verdict, solutionId: solution._id });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { submitCode };