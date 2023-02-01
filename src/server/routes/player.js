const express = require('express');
const connectEnsureLogin = require('connect-ensure-login');

const router = express.Router();

// const login controller
const { get } = require('../controllers/playerController');

// Contact routes
router.get('/:id', connectEnsureLogin.ensureLoggedIn(), get);

// Export API routes
module.exports = router;
