const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.post('/', healthController.createAlert);  // 새로운 건강 이상 기록을 생성
router.get('/alerts', healthController.getAlerts);  // 전체 건강 이상 기록 조회
router.get('/alerts/:userId', healthController.getUserAlerts);  // 특정 사용자 기록 조회

module.exports = router;
