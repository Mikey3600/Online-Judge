const express = require('express');
const verifyToken = require('../middleware/auth');
const { hint, chat } = require('../controllers/aiController');

const router = express.Router();

router.post('/hint', verifyToken, hint);
router.post('/chat', verifyToken, chat);

module.exports = router;
