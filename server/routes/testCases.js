const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { addTestCase, getTestCases, deleteTestCase } = require('../controllers/testCaseController');

router.post('/', verifyToken , addTestCase);
router.get('/:problemId', getTestCases);
router.delete('/:id', verifyToken, deleteTestCase);

module.exports = router;
