const express = require('express');
const router = express.Router();
const { handleOCRData, handleSchedule } = require('../controllers/medicationController');

// OCR 데이터를 저장하는 POST API
router.post('/ocr', handleOCRData);

router.post('/schedule', handleSchedule);

module.exports = router;
