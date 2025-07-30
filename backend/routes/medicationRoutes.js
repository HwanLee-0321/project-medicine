const express = require('express');
const router = express.Router();
const { handleOCRData } = require('../controllers/medicationController');

// OCR 데이터를 저장하는 POST API
router.post('/ocr', handleOCRData);

module.exports = router;
