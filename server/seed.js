const mongoose = require('mongoose');
const Problem = require('./models/Problem');
const TestCase = require('./models/TestCase');
require('dotenv').config();

const problems = [
    // ==========================================
    // EASY PROBLEMS (10)
    // ==========================================
    {
        name: 'Contains Duplicate',
        code: 'E001',
        difficulty: 'Easy',
        statement: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.\n\nInput:\nFirst line contains N (size of array).\nSecond line contains N space-separated integers.\n\nOutput:\ntrue or false\n\nExample:\nInput:\n4\n1 2 3 1\nOutput: true',
        testCases: [
            { input: '4\n1 2 3 1', output: 'true' },
            { input: '4\n1 2 3 4', output: 'false' },
            { input: '6\n1 1 1 3 3 4', output: 'true' }
        ]
    },
    {
        name: 'Valid Anagram',
        code: 'E002',
        difficulty: 'Easy',
        statement: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nInput:\nTwo lines containing string s and string t respectively.\n\nOutput:\ntrue or false\n\nExample:\nInput:\nanagram\nnagaram\nOutput: true',
        testCases: [
            { input: 'anagram\nnagaram', output: 'true' },
            { input: 'rat\ncar', output: 'false' }
        ]
    },
    {
        name: 'Two Sum',
        code: 'E003',
        difficulty: 'Easy',
        statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.\n\nInput:\nFirst line contains N and target.\nSecond line contains N space-separated integers.\n\nOutput:\nTwo space-separated indices (in ascending order).\n\nExample:\nInput:\n4 9\n2 7 11 15\nOutput: 0 1',
        testCases: [
            { input: '4 9\n2 7 11 15', output: '0 1' },
            { input: '3 6\n3 2 4', output: '1 2' },
            { input: '2 6\n3 3', output: '0 1' }
        ]
    },
    {
        name: 'Valid Palindrome',
        code: 'E004',
        difficulty: 'Easy',
        statement: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.\n\nInput:\nA single line string s.\n\nOutput:\ntrue or false\n\nExample:\nInput:\nA man, a plan, a canal: Panama\nOutput: true',
        testCases: [
            { input: 'A man, a plan, a canal: Panama', output: 'true' },
            { input: 'race a car', output: 'false' },
            { input: 'a', output: 'true' }
        ]
    },
    {
        name: 'Valid Parentheses',
        code: 'E005',
        difficulty: 'Easy',
        statement: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'\}\', \'[\' and \']\', determine if the input string is valid.\nAn input string is valid if open brackets are closed by the same type of brackets and in the correct order.\n\nInput:\nA single line containing string s.\n\nOutput:\ntrue or false\n\nExample:\nInput:\n()[]{}\nOutput: true',
        testCases: [
            { input: '()', output: 'true' },
            { input: '()[]{}', output: 'true' },
            { input: '(]', output: 'false' },
            { input: '([)]', output: 'false' }
        ]
    },
    {
        name: 'Binary Search',
        code: 'E006',
        difficulty: 'Easy',
        statement: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nInput:\nFirst line contains N and target.\nSecond line contains N space-separated integers.\n\nOutput:\nIndex of target or -1.\n\nExample:\nInput:\n6 9\n-1 0 3 5 9 12\nOutput: 4',
        testCases: [
            { input: '6 9\n-1 0 3 5 9 12', output: '4' },
            { input: '6 2\n-1 0 3 5 9 12', output: '-1' }
        ]
    },
    {
        name: 'Reverse Linked List',
        code: 'E007',
        difficulty: 'Easy',
        statement: 'Given the head of a singly linked list, reverse the list, and return the reversed list values.\n\nInput:\nFirst line contains N (number of nodes).\nSecond line contains N space-separated node values.\n\nOutput:\nN space-separated reversed values.\n\nExample:\nInput:\n5\n1 2 3 4 5\nOutput: 5 4 3 2 1',
        testCases: [
            { input: '5\n1 2 3 4 5', output: '5 4 3 2 1' },
            { input: '2\n1 2', output: '2 1' },
            { input: '1\n42', output: '42' }
        ]
    },
    {
        name: 'Invert Binary Tree',
        code: 'E008',
        difficulty: 'Easy',
        statement: 'Given the root of a binary tree, invert the tree, and return its level-order traversal.\n\nInput:\nFirst line contains N (number of nodes in level order representation, where -1 represents null).\nSecond line contains N space-separated values.\n\nExample:\nInput:\n7\n4 2 7 1 3 6 9\nOutput: 4 7 2 9 6 3 1',
        testCases: [
            { input: '7\n4 2 7 1 3 6 9', output: '4 7 2 9 6 3 1' },
            { input: '3\n2 1 3', output: '2 3 1' }
        ]
    },
    {
        name: 'Maximum Depth of Binary Tree',
        code: 'E009',
        difficulty: 'Easy',
        statement: 'Given the root of a binary tree, return its maximum depth.\n\nInput:\nLevel order representation array size followed by elements (use -1 for null).\n\nExample:\nInput:\n7\n3 9 20 -1 -1 15 7\nOutput: 3',
        testCases: [
            { input: '7\n3 9 20 -1 -1 15 7', output: '3' },
            { input: '2\n1 -1 2', output: '2' }
        ]
    },
    {
        name: 'Best Time to Buy and Sell Stock',
        code: 'E010',
        difficulty: 'Easy',
        statement: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.\n\nInput:\nFirst line contains N.\nSecond line contains N space-separated integers.\n\nOutput:\nMaximum profit.\n\nExample:\nInput:\n6\n7 1 5 3 6 4\nOutput: 5',
        testCases: [
            { input: '6\n7 1 5 3 6 4', output: '5' },
            { input: '5\n7 6 4 3 1', output: '0' }
        ]
    },

    // ==========================================
    // MEDIUM PROBLEMS (10)
    // ==========================================
    {
        name: 'Group Anagrams',
        code: 'M001',
        difficulty: 'Medium',
        statement: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.\n\nInput:\nFirst line contains N.\nSecond line contains N space-separated strings.\n\nOutput:\nGrouped anagrams (each group sorted, separated by newlines).\n\nExample:\nInput:\n6\neat tea tan ate nat bat\nOutput:\nbat\neat ate tea\ntan nat',
        testCases: [
            { input: '6\neat tea tan ate nat bat', output: 'bat\neat ate tea\ntan nat' }
        ]
    },
    {
        name: 'Top K Frequent Elements',
        code: 'M002',
        difficulty: 'Medium',
        statement: 'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.\n\nInput:\nFirst line contains N and K.\nSecond line contains N space-separated integers.\n\nOutput:\nK space-separated integers ordered by frequency.\n\nExample:\nInput:\n6 2\n1 1 1 2 2 3\nOutput: 1 2',
        testCases: [
            { input: '6 2\n1 1 1 2 2 3', output: '1 2' },
            { input: '1 1\n1', output: '1' }
        ]
    },
    {
        name: 'Product of Array Except Self',
        code: 'M003',
        difficulty: 'Medium',
        statement: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. Solve without using the division operator.\n\nInput:\nFirst line contains N.\nSecond line contains N space-separated integers.\n\nOutput:\nN space-separated integers.\n\nExample:\nInput:\n4\n1 2 3 4\nOutput: 24 12 8 6',
        testCases: [
            { input: '4\n1 2 3 4', output: '24 12 8 6' },
            { input: '5\n-1 1 0 -3 3', output: '0 0 9 0 0' }
        ]
    },
    {
        name: 'Longest Consecutive Sequence',
        code: 'M004',
        difficulty: 'Medium',
        statement: 'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\nYour algorithm must run in O(n) time.\n\nInput:\nFirst line contains N.\nSecond line contains N space-separated integers.\n\nOutput:\nLength of the sequence.\n\nExample:\nInput:\n6\n100 4 200 1 3 2\nOutput: 4',
        testCases: [
            { input: '6\n100 4 200 1 3 2', output: '4' },
            { input: '10\n0 3 7 2 5 8 4 6 0 1', output: '9' }
        ]
    },
    {
        name: 'Two Sum II - Input Array Is Sorted',
        code: 'M005',
        difficulty: 'Medium',
        statement: 'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.\n\nInput:\nFirst line contains N and target.\nSecond line contains N space-separated integers.\n\nOutput:\nTwo 1-based indices.\n\nExample:\nInput:\n4 9\n2 7 11 15\nOutput: 1 2',
        testCases: [
            { input: '4 9\n2 7 11 15', output: '1 2' },
            { input: '3 6\n2 3 4', output: '1 3' }
        ]
    },
    {
        name: '3Sum',
        code: 'M006',
        difficulty: 'Medium',
        statement: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nInput:\nFirst line contains N.\nSecond line contains N space-separated integers.\n\nOutput:\nUnique triplets where values are sorted within triplets, separated by newlines.\n\nExample:\nInput:\n6\n-1 0 1 2 -1 -4\nOutput:\n-1 -1 2\n-1 0 1',
        testCases: [
            { input: '6\n-1 0 1 2 -1 -4', output: '-1 -1 2\n-1 0 1' },
            { input: '3\n0 0 0', output: '0 0 0' }
        ]
    },
    {
        name: 'Container With Most Water',
        code: 'M007',
        difficulty: 'Medium',
        statement: 'You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.\n\nInput:\nFirst line contains N.\nSecond line contains N space-separated integers.\n\nOutput:\nMax area.\n\nExample:\nInput:\n9\n1 8 6 2 5 4 8 3 7\nOutput: 49',
        testCases: [
            { input: '9\n1 8 6 2 5 4 8 3 7', output: '49' },
            { input: '2\n1 1', output: '1' }
        ]
    },
    {
        name: 'Longest Substring Without Repeating Characters',
        code: 'M008',
        difficulty: 'Medium',
        statement: 'Given a string s, find the length of the longest substring without repeating characters.\n\nInput:\nA single line string s.\n\nOutput:\nInteger length.\n\nExample:\nInput:\nabcabcbb\nOutput: 3',
        testCases: [
            { input: 'abcabcbb', output: '3' },
            { input: 'bbbbb', output: '1' },
            { input: 'pwwkew', output: '3' }
        ]
    },
    {
        name: 'Longest Repeating Character Replacement',
        code: 'M009',
        difficulty: 'Medium',
        statement: 'You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times. Return the length of the longest substring containing the same letter you can get after performing the above operations.\n\nInput:\nFirst line contains string s.\nSecond line contains integer K.\n\nOutput:\nMax consecutive identical length.\n\nExample:\nInput:\nABAB\n2\nOutput: 4',
        testCases: [
            { input: 'ABAB\n2', output: '4' },
            { input: 'AABABBA\n1', output: '4' }
        ]
    },
    {
        name: 'Find Minimum in Rotated Sorted Array',
        code: 'M010',
        difficulty: 'Medium',
        statement: 'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element of this array.\n\nInput:\nFirst line contains N.\nSecond line contains N space-separated integers.\n\nOutput:\nMinimum element.\n\nExample:\nInput:\n5\n3 4 5 1 2\nOutput: 1',
        testCases: [
            { input: '5\n3 4 5 1 2', output: '1' },
            { input: '7\n4 5 6 7 0 1 2', output: '0' }
        ]
    },

    // ==========================================
    // HARD PROBLEMS (10)
    // ==========================================
    {
        name: 'Minimum Window Substring',
        code: 'H001',
        difficulty: 'Hard',
        statement: 'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return "-1".\n\nInput:\nTwo strings s and t on separate lines.\n\nOutput:\nThe minimal substring.\n\nExample:\nInput:\nADOBECODEBANC\nABC\nOutput: BANC',
        testCases: [
            { input: 'ADOBECODEBANC\nABC', output: 'BANC' },
            { input: 'a\na', output: 'a' },
            { input: 'a\nb', output: '-1' }
        ]
    },
    {
        name: 'Sliding Window Maximum',
        code: 'H002',
        difficulty: 'Hard',
        statement: 'You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window values.\n\nInput:\nFirst line contains N and K.\nSecond line contains N space-separated integers.\n\nOutput:\nSpace-separated maximum values for each window window.\n\nExample:\nInput:\n8 3\n1 3 -1 -3 5 3 6 7\nOutput: 3 3 5 5 6 7',
        testCases: [
            { input: '8 3\n1 3 -1 -3 5 3 6 7', output: '3 3 5 5 6 7' },
            { input: '1 1\n1', output: '1' }
        ]
    },
    {
        name: 'Largest Rectangle in Histogram',
        code: 'H003',
        difficulty: 'Hard',
        statement: 'Given an array of integers heights representing the histogram\'s bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.\n\nInput:\nFirst line contains N.\nSecond line contains N space-separated integers.\n\nOutput:\nMaximum area value.\n\nExample:\nInput:\n6\n2 1 5 6 2 3\nOutput: 10',
        testCases: [
            { input: '6\n2 1 5 6 2 3', output: '10' },
            { input: '2\n2 4', output: '4' }
        ]
    },
    {
        name: 'Merge k Sorted Lists',
        code: 'H004',
        difficulty: 'Hard',
        statement: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.\n\nInput:\nFirst line contains K (number of lists).\nNext K lines each contain a list (First value is array size size N, followed by N space-separated integers).\n\nOutput:\nSpace separated values of the merged sorted list.\n\nExample:\nInput:\n3\n3 1 4 5\n3 1 3 4\n2 2 6\nOutput: 1 1 2 3 4 4 5 6',
        testCases: [
            { input: '3\n3 1 4 5\n3 1 3 4\n2 2 6', output: '1 1 2 3 4 4 5 6' }
        ]
    },
    {
        name: 'Reverse Nodes in k-Group',
        code: 'H005',
        difficulty: 'Hard',
        statement: 'Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.\nIf the number of nodes is not a multiple of k left-out nodes, in the end, should remain as it is.\n\nInput:\nFirst line contains N and K.\nSecond line contains N values.\n\nOutput:\nSpace-separated output node track.\n\nExample:\nInput:\n5 2\n1 2 3 4 5\nOutput: 2 1 4 3 5',
        testCases: [
            { input: '5 2\n1 2 3 4 5', output: '2 1 4 3 5' },
            { input: '5 3\n1 2 3 4 5', output: '3 2 1 4 5' }
        ]
    },
    {
        name: 'Binary Tree Maximum Path Sum',
        code: 'H006',
        difficulty: 'Hard',
        statement: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Given the root of a binary tree, return the maximum path sum of any non-empty path.\n\nInput:\nSize of array followed by elements in standard level order serialization (-1 for null).\n\nOutput:\nMax path sum.\n\nExample:\nInput:\n3\n1 2 3\nOutput: 6',
        testCases: [
            { input: '3\n1 2 3', output: '6' },
            { input: '7\n-10 9 20 -1 -1 15 7', output: '42' }
        ]
    },
    {
        name: 'Serialize and Deserialize Binary Tree',
        code: 'H007',
        difficulty: 'Hard',
        statement: 'Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. Your output check should match the input string exact mapping.\n\nInput:\nA single level order string formatting.\n\nOutput:\nSerialized structural layout output string identical configuration.\n\nExample:\nInput:\n1,2,3,null,null,4,5\nOutput: 1,2,3,null,null,4,5',
        testCases: [
            { input: '1,2,3,null,null,4,5', output: '1,2,3,null,null,4,5' },
            { input: '1,null,2', output: '1,null,2' }
        ]
    },
    {
        name: 'Median from Data Stream',
        code: 'H008',
        difficulty: 'Hard',
        statement: 'Implement a data structure supporting addition of integers from a stream and finding the median of current numbers.\n\nInput:\nFirst line contains Operations count Q.\nNext Q lines contain either "add X" or "find".\n\nOutput:\nReturn decimal values for each "find" command query.\n\nExample:\nInput:\n4\nadd 1\nadd 2\nfind\nadd 3\nfind\nOutput:\n1.5\n2.0',
        testCases: [
            { input: '5\nadd 1\nadd 2\nfind\nadd 3\nfind', output: '1.5\n2.0' }
        ]
    },
    {
        name: 'Edit Distance',
        code: 'H009',
        difficulty: 'Hard',
        statement: 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\nYou have 3 operations permitted on a word: Insert, Delete, or Replace a character.\n\nInput:\nTwo strings separated on new lines.\n\nOutput:\nMinimum edit distance counts.\n\nExample:\nInput:\nhorse\nros\nOutput: 3',
        testCases: [
            { input: 'horse\nros', output: '3' },
            { input: 'intention\nexecution', output: '5' }
        ]
    },
    {
        name: 'N-Queens',
        code: 'H010',
        difficulty: 'Hard',
        statement: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return the number of distinct solutions.\n\nInput:\nSingle integer N.\n\nOutput:\nTotal distinct configurations layout count.\n\nExample:\nInput:\n4\nOutput: 2',
        testCases: [
            { input: '4', output: '2' },
            { input: '1', output: '1' }
        ]
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Clearing old system logs and problem database collections...');
        await Problem.deleteMany({});
        await TestCase.deleteMany({});
        console.log('Database successfully cleaned.');

        for (const p of problems) {
            const problem = await Problem.create({
                name: p.name,
                code: p.code,
                difficulty: p.difficulty,
                statement: p.statement
            });

            for (const tc of p.testCases) {
                await TestCase.create({
                    input: tc.input,
                    output: tc.output,
                    problem: problem._id
                });
            }

            console.log(`[+] Created: (${p.code}) - ${p.name}`);
        }

        console.log('\n🚀 NeetCode Seeding Complete! Enjoy your updated platform environment!');
        process.exit(0);
    } catch (err) {
        console.error('⚠️ Seeding error occurred:', err);
        process.exit(1);
    }
};

seed();