const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { protect } = require('../authMiddleware');

// 내 건강 이상 기록 생성
router.post('/', protect, healthController.createAlert);

// 내 건강 이상 기록 조회
router.get('/', protect, healthController.getUserAlerts);

// 관리자용: 전체 건강 이상 기록 조회 (필요 시 별도 관리자 권한 미들웨어 추가)
router.get('/all', healthController.getAlerts);

module.exports = router;
