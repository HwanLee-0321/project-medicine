const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// POST: 건강 이상 기록
router.post('/api/alerts', healthController.createAlert);

// GET: 전체 기록
router.get('/alerts', healthController.getAlerts);

// GET: 특정 사용자 기록
router.get('/alerts/:userId', healthController.getUserAlerts);

module.exports = router;
