const express = require('express');

const router = express.Router();

// const controller
const { get, post } = require('../controllers/hacpController');

// Contact routes
router.get('/', get);
router.post('/', post);

// Export API routes
module.exports = router;
