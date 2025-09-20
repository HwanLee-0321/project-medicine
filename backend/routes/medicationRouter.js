const express = require('express');
const router = express.Router();
const { handleOCRData, handleSchedule, mealTime, readMealTime, readOCRData, confirmMedication } = require('../controllers/medicationController');
const User = require('../db/Users');
const { Expo } = require('expo-server-sdk');
const { protect } = require('../authMiddleware');

const expo = new Expo();
async function sendPushNotifications(tokens, message) {
    const messages = tokens.map(token => ({ to: token, sound: 'default', title: message.title, body: message.body, data: message.data }));
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) tickets.push(...await expo.sendPushNotificationsAsync(chunk));
    return tickets;
}

router.post('/ocr', protect, handleOCRData);
router.post('/ocr/read', protect, readOCRData);
router.post('/schedule', protect, handleSchedule);
router.post('/time', protect, mealTime);
router.post('/time/read', protect, readMealTime);
router.post('/confirm', protect, confirmMedication);

router.post('/register-token', protect, async (req, res) => {
    const { user_id } = req.user; // 🔐 JWT에서 사용자 ID 추출
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'token required' });
    try {
        const user = await User.findByPk(user_id);
        if (!user) return res.status(404).json({ success: false, message: 'user not found' });
        user.expo_push_token = token;
        await user.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;
