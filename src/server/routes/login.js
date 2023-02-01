const express = require('express');
const passport = require('passport');

const router = express.Router();

// const login controller
const { get, post } = require('../controllers/loginController');

// Contact routes
router.get('/', get);

router.post('/', passport.authenticate('local', { failureRedirect: '/login' }), post);

// Export API routes
module.exports = router;
