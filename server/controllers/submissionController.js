const Solution = require('../models/Solution');
const TestCase = require('../models/TestCase');
const Problem = require('../models/Problem');
const runCode = require('../executors/runCode');

const submitCode = async (req, res) => {
    try {
        const { problemId, code } = req.body;
        const userId = req.user.userId;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const testCases = await TestCase.find({ problem: problemId });
        if (testCases.length === 0) {
            return res.status(400).json({ message: 'No test cases found for this problem' });
        }

        let verdict = 'Accepted';

        for (let tc of testCases) {
            const result = await runCode(code, tc.input);

            console.log('OUTPUT:', JSON.stringify(result.output));
            console.log('EXPECTED:', JSON.stringify(tc.output.trim()));
            console.log('VERDICT FROM RUNNER:', result.verdict);

            if (result.verdict === 'Compilation Error') { verdict = 'Compilation Error'; break; }
            if (result.verdict === 'Time Limit Exceeded') { verdict = 'Time Limit Exceeded'; break; }
            if (result.verdict === 'Runtime Error') { verdict = 'Runtime Error'; break; }

            if (result.output.trim() !== tc.output.trim()) {
                verdict = 'Wrong Answer';
                break;
            }
        }

        const solution = await Solution.create({ problem: problemId, user: userId, verdict });
        res.status(200).json({ verdict, solutionId: solution._id });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { submitCode };
