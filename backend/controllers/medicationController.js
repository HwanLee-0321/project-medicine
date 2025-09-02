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

// (중략) 기존 OCR, Schedule, MealTime, readOCRData 함수 그대로 유지

// ✅ 복약 완료 → daily_health_log + Expo Push
const confirmMedication = async (req, res) => {
  const { user_id, med_nm, meal_time } = req.body;
  if (!user_id || !med_nm || !meal_time)
    return res.status(400).json({ success: false, message: 'user_id/med_nm/meal_time required' });

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

module.exports = { handleOCRData, handleSchedule, mealTime, readMealTime, readOCRData, confirmMedication };
