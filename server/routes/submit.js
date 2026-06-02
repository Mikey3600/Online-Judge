const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { submitCode } = require('../controllers/submissionController');

router.post('/', verifyToken, submitCode);

module.exports = router;
