const express = require('express');
const router = express.Router();
const { handleOCRData, handleSchedule, mealTime, readMealTime, readOCRData } = require('../controllers/medicationController');
const User = require('../db/Users');
const MedicationLog = require('../db/Medication_schedule');
const Medication = require('../db/Medications');
const { Expo } = require('expo-server-sdk');

// ========================================
// Expo 서버 SDK 설정
const expo = new Expo();

// 실제 Push 전송 함수
async function sendPushNotifications(tokens, message) {
  const messages = tokens.map(token => ({
    to: token,
    sound: 'default',
    title: message.title,
    body: message.body,
    data: message.data,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }
  return tickets;
}
// ========================================

// 기존 OCR/스케줄 라우트
router.post('/ocr', handleOCRData);
router.post('/ocr/read', readOCRData);
router.post('/schedule', handleSchedule);
router.post('/time', mealTime);
router.post('/time/read', readMealTime);

// ✅ Expo Push Token 등록
router.post('/register-token', async (req, res) => {
  const { user_id, token } = req.body;
  if (!user_id || !token) return res.status(400).json({ success: false, message: 'user_id/token required' });

  try {
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ success: false, message: 'user not found' });

    user.expo_push_token = token;
    await user.save();

    console.log('[테스트] 토큰 저장 완료:', user_id, token);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ✅ 복약 완료 → DB 기록 → 실제 Expo Push 전송
router.post('/confirm', async (req, res) => {
  const { user_id, med_nm } = req.body;
  if (!user_id || !med_nm) return res.status(400).json({ success: false, message: 'user_id/med_nm required' });

  try {
    const medication = await Medication.findOne({
      where: { user_id, med_nm },
      attributes: ['id', 'user_id', 'med_nm', 'dosage']
    });
    if (!medication) return res.status(404).json({ success: false, message: 'medication not found' });

    // MedicationLog 기록 생성
    const log = await MedicationLog.create({
      user_id,
      med_nm,
      dosage: medication.dosage,
      scheduled_date: new Date().toISOString().split('T')[0], // 오늘 날짜
      meal_time: '08:00:00', // 예시: 아침
      status: 'y', // 복용 완료
      taken_time: new Date()
    });

    // 사용자 DB에서 Push Token 조회
    const usersWithToken = await User.findAll();
    const tokens = usersWithToken.map(u => u.expo_push_token).filter(Boolean);

    // Expo Push 전송
    const tickets = await sendPushNotifications(tokens, {
      title: '복약 알림',
      body: `${user_id}님이 ${med_nm} 복용 완료`,
      data: { user_id, med_nm }
    });

    res.json({ success: true, log, tickets });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
