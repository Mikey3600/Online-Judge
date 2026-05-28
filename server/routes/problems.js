const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
    getAllProblems,
    getProblemById,
    createProblem,
    updateProblem,
    deleteProblem
} = require('../controllers/problemController');

// Public routes — anyone can view problems
router.get('/', getAllProblems);
router.get('/:id', getProblemById);

// Protected routes — must be logged in
router.post('/', verifyToken, createProblem);
router.put('/:id', verifyToken, updateProblem);
router.delete('/:id', verifyToken, deleteProblem);

module.exports = router;