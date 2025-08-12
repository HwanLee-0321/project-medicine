const express = require('express');
const router = express.Router();
const { handleOCRData, handleSchedule, mealTime } = require('../controllers/medicationController');

// OCR 데이터를 저장하는 POST API
router.post('/ocr', handleOCRData);  // 복약 정보
router.post('/schedule', handleSchedule);  // 복약 스케줄 관리
router.post('/time', mealTime);

module.exports = router; 
