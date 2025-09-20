const express = require('express');
const router = express.Router();
const { getDailySummary } = require('../controllers/calendarController');

router.get('/daily-summary', getDailySummary);

module.exports = router;
