const express = require('express');
const router = express.Router();
const { handleOCRData, handleSchedule, mealTime, readMealTime, readOCRData } = require('../controllers/medicationController');

// OCR 데이터를 저장하는 POST API
router.post('/ocr', handleOCRData);  // 복약 정보
router.post('/ocr/read', readOCRData);  // 복약 정보 조회
router.post('/schedule', handleSchedule);  // 복약 스케줄 관리
router.post('/time', mealTime);  // 복약 시간, 정보 저장 
router.get('/time/read', readMealTime);  // 복약 일정 조회

module.exports = router; 
