const express = require('express');

const router = express.Router();

// const home controller
const { get } = require('../controllers/homeController');

// Contact routes
router.get('/', get);

// Export API routes
module.exports = router;
