const express = require('express');

const router = express.Router();

// const login controller
const { get, post } = require('../controllers/registerController');

// Contact routes
router.get('/', get);

router.post('/', post);

// Export API routes
module.exports = router;
