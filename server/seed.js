const mongoose = require('mongoose');
const Problem = require('./models/Problem');
const TestCase = require('./models/TestCase');
require('dotenv').config();

const problems = [
    {
        name: 'Reverse a Number',
        code: 'P004',
        difficulty: 'Easy',
        statement: 'Given an integer N, print its digits in reverse order.\n\nInput: A single integer N.\nOutput: Print the reversed number.\n\nExample:\nInput: 1234\nOutput: 4321',
        testCases: [{ input: '1234', output: '4321' }, { input: '100', output: '1' }, { input: '9', output: '9' }]
    },
    {
        name: 'Check Even or Odd',
        code: 'P005',
        difficulty: 'Easy',
        statement: 'Given an integer N, print "Even" if it is even, otherwise print "Odd".\n\nInput: A single integer N.\nOutput: Print Even or Odd.\n\nExample:\nInput: 4\nOutput: Even',
        testCases: [{ input: '4', output: 'Even' }, { input: '7', output: 'Odd' }, { input: '0', output: 'Even' }]
    },
    {
        name: 'Factorial',
        code: 'P006',
        difficulty: 'Easy',
        statement: 'Given a non-negative integer N, print its factorial.\n\nInput: A single integer N (0 <= N <= 12).\nOutput: Print N!\n\nExample:\nInput: 5\nOutput: 120',
        testCases: [{ input: '5', output: '120' }, { input: '0', output: '1' }, { input: '10', output: '3628800' }]
    },
    {
        name: 'Fibonacci Nth Term',
        code: 'P007',
        difficulty: 'Easy',
        statement: 'Given N, print the Nth Fibonacci number (0-indexed).\n\nInput: A single integer N (0 <= N <= 20).\nOutput: Print the Nth Fibonacci number.\n\nExample:\nInput: 6\nOutput: 8',
        testCases: [{ input: '6', output: '8' }, { input: '0', output: '0' }, { input: '10', output: '55' }]
    },
    {
        name: 'Check Prime',
        code: 'P008',
        difficulty: 'Easy',
        statement: 'Given an integer N, print "Prime" if it is prime, otherwise print "Not Prime".\n\nInput: A single integer N.\nOutput: Print Prime or Not Prime.\n\nExample:\nInput: 7\nOutput: Prime',
        testCases: [{ input: '7', output: 'Prime' }, { input: '4', output: 'Not Prime' }, { input: '2', output: 'Prime' }, { input: '1', output: 'Not Prime' }]
    },
    {
        name: 'Sum of Array',
        code: 'P009',
        difficulty: 'Easy',
        statement: 'Given N integers, print their sum.\n\nInput: First line contains N. Second line contains N space-separated integers.\nOutput: Print the sum.\n\nExample:\nInput:\n5\n1 2 3 4 5\nOutput: 15',
        testCases: [{ input: '5\n1 2 3 4 5', output: '15' }, { input: '3\n10 20 30', output: '60' }, { input: '1\n42', output: '42' }]
    },
    {
        name: 'Maximum of Array',
        code: 'P010',
        difficulty: 'Easy',
        statement: 'Given N integers, print the maximum.\n\nInput: First line contains N. Second line contains N space-separated integers.\nOutput: Print the maximum element.\n\nExample:\nInput:\n5\n3 1 4 1 5\nOutput: 5',
        testCases: [{ input: '5\n3 1 4 1 5', output: '5' }, { input: '3\n10 20 30', output: '30' }, { input: '4\n-1 -2 -3 -4', output: '-1' }]
    },
    {
        name: 'Count Digits',
        code: 'P011',
        difficulty: 'Easy',
        statement: 'Given an integer N, print the number of digits in N.\n\nInput: A single integer N.\nOutput: Print count of digits.\n\nExample:\nInput: 12345\nOutput: 5',
        testCases: [{ input: '12345', output: '5' }, { input: '0', output: '1' }, { input: '9999999', output: '7' }]
    },
    {
        name: 'Power of Two',
        code: 'P012',
        difficulty: 'Easy',
        statement: 'Given an integer N, print "Yes" if it is a power of 2, otherwise print "No".\n\nInput: A single integer N.\nOutput: Print Yes or No.\n\nExample:\nInput: 8\nOutput: Yes',
        testCases: [{ input: '8', output: 'Yes' }, { input: '6', output: 'No' }, { input: '1', output: 'Yes' }, { input: '0', output: 'No' }]
    },
    {
        name: 'GCD of Two Numbers',
        code: 'P013',
        difficulty: 'Easy',
        statement: 'Given two integers A and B, print their GCD.\n\nInput: Two space-separated integers A and B.\nOutput: Print GCD(A, B).\n\nExample:\nInput: 12 8\nOutput: 4',
        testCases: [{ input: '12 8', output: '4' }, { input: '100 75', output: '25' }, { input: '7 13', output: '1' }]
    },
    {
        name: 'Palindrome Check',
        code: 'P014',
        difficulty: 'Easy',
        statement: 'Given an integer N, print "Yes" if it is a palindrome, otherwise print "No".\n\nInput: A single integer N.\nOutput: Print Yes or No.\n\nExample:\nInput: 121\nOutput: Yes',
        testCases: [{ input: '121', output: 'Yes' }, { input: '123', output: 'No' }, { input: '1', output: 'Yes' }, { input: '1221', output: 'Yes' }]
    },
    {
        name: 'Sum of Digits',
        code: 'P015',
        difficulty: 'Easy',
        statement: 'Given an integer N, print the sum of its digits.\n\nInput: A single integer N.\nOutput: Print sum of digits.\n\nExample:\nInput: 1234\nOutput: 10',
        testCases: [{ input: '1234', output: '10' }, { input: '999', output: '27' }, { input: '100', output: '1' }]
    },
    {
        name: 'Minimum of Array',
        code: 'P016',
        difficulty: 'Easy',
        statement: 'Given N integers, print the minimum.\n\nInput: First line contains N. Second line contains N space-separated integers.\nOutput: Print the minimum element.\n\nExample:\nInput:\n5\n3 1 4 1 5\nOutput: 1',
        testCases: [{ input: '5\n3 1 4 1 5', output: '1' }, { input: '3\n10 20 30', output: '10' }, { input: '4\n-1 -2 -3 -4', output: '-4' }]
    }
];

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const p of problems) {
        const existing = await Problem.findOne({ code: p.code });
        if (existing) {
            console.log(`Skipping ${p.code} — already exists`);
            continue;
        }

        const problem = await Problem.create({
            name: p.name,
            code: p.code,
            difficulty: p.difficulty,
            statement: p.statement
        });

        for (const tc of p.testCases) {
            await TestCase.create({ input: tc.input, output: tc.output, problem: problem._id });
        }

        console.log(`Created: ${p.name}`);
    }

    console.log('Seeding complete!');
    process.exit(0);
};

seed().catch(err => {
    console.error(err);
    process.exit(1);
});