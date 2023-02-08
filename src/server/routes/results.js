const express = require('express');
const { ensureLoggedIn } = require('connect-ensure-login');

const router = express.Router();

// const login controller
const { get } = require('../controllers/resultsController');

// Contact routes
router.get('/', ensureLoggedIn(), get);

// Export API routes
module.exports = router;
