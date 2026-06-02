const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { addTestCase, getTestCases, updateTestCase, deleteTestCase } = require('../controllers/testCaseController');

router.post('/', verifyToken, addTestCase);
router.get('/:problemId', getTestCases);
router.put('/:id', verifyToken, updateTestCase);
router.delete('/:id', verifyToken, deleteTestCase);

module.exports = router;
