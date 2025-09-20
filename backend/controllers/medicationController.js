const { DataTypes } = require('sequelize');
const Medications = require('../db/Medications');
const MedicationSchedule = require('../db/Medication_schedule');
const MealTime = require('../db/Meal_time');
const User = require('../db/Users');
const DailyHealthLog = require('../db/DailyHealthLog');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

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

// (중략) 기존 OCR, Schedule, MealTime, readOCRData 함수는 user_id를 이미 인자로 받으므로 그대로 유지
// 라우터에서 protect 미들웨어를 통과하면 req.user.user_id를 해당 함수들에 넘겨주도록 수정해야 합니다.
// 이 파일에서는 confirmMedication만 직접적인 수정 대상입니다.

// ✅ 복약 완료 → daily_health_log + Expo Push
const confirmMedication = async (req, res) => {
  const { user_id } = req.user; // 🔐 JWT에서 사용자 ID 추출
  const { med_nm, meal_time } = req.body;
  if (!med_nm || !meal_time)
    return res.status(400).json({ success: false, message: 'med_nm/meal_time required' });

  try {
    const medication = await Medications.findOne({ where: { user_id, med_nm } });
    if (!medication) return res.status(404).json({ success: false, message: 'medication not found' });

    // 1️⃣ MedicationSchedule 기록
    const scheduledDate = new Date().toISOString().split('T')[0];
    await MedicationSchedule.create({
      user_id,
      med_nm,
      dosage: medication.dosage,
      scheduled_date: scheduledDate,
      meal_time,
      status: 'y',
      taken_time: new Date(),
    });

    // 2️⃣ DailyHealthLog 업데이트
    const [dailyLog, created] = await DailyHealthLog.findOrCreate({
      where: { user_id, log_date: scheduledDate, meal_time },
      defaults: { medication_count: 1, symptom_count: 0 },
    });

    if (!created) {
      dailyLog.medication_count += 1;
      await dailyLog.save();
    }

    // 3️⃣ Expo Push 전송
    const usersWithToken = await User.findAll();
    const tokens = usersWithToken.map(u => u.expo_push_token).filter(Boolean);
    const tickets = await sendPushNotifications(tokens, {
      title: '복약 알림',
      body: `${user_id}님이 ${med_nm} 복용 완료`,
      data: { user_id, med_nm },
    });

    res.json({ success: true, dailyLog, tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// handleOCRData, handleSchedule, mealTime, readMealTime, readOCRData 등 다른 함수들은
// user_id를 파라미터로 받도록 설계되어 있으므로, 라우터 레벨에서 req.user.user_id를 넘겨주도록 처리해야 합니다.
// 이 파일 자체의 변경은 confirmMedication에 한정됩니다.
module.exports = { handleOCRData, handleSchedule, mealTime, readMealTime, readOCRData, confirmMedication };

