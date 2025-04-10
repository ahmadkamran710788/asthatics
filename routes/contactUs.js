const express = require('express');
const { handleContactSubmission } = require('../controllers/contactController');
const router = express.Router();

router.post('/', handleContactSubmission);

module.exports = router;