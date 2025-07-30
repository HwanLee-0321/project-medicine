const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medController');

router.post('/take', medicationController.recordMedicationIntake);

module.exports = router;
