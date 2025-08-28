const HealthAlert = require('../db/Health_alerts');
const DailyHealthLog = require('../db/DailyHealthLog');

// ✅ 건강 이상 징후 기록 + DailyHealthLog 업데이트
exports.createAlert = async (req, res) => {
  const { user_id, alert_type, meal_time } = req.body;
  if (!user_id || !alert_type || !meal_time)
    return res.status(400).json({ message: 'user_id/alert_type/meal_time required' });

  try {
    const detected_at = new Date();
    const logDate = detected_at.toISOString().split('T')[0];

    // 1️⃣ HealthAlert 기록 생성
    const newAlert = await HealthAlert.create({ user_id, alert_type, detected_at });

    // 2️⃣ DailyHealthLog 업데이트
    const [dailyLog, created] = await DailyHealthLog.findOrCreate({
      where: { user_id, log_date: logDate, meal_time },
      defaults: { medication_count: 0, symptom_count: 1 },
    });

    if (!created) {
      dailyLog.symptom_count += 1;
      await dailyLog.save();
    }

    res.status(201).json({ message: 'Alert created', alertId: newAlert.id, dailyLog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 전체 HealthAlert 조회
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await HealthAlert.findAll({ order: [['detected_at', 'DESC']] });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 특정 사용자 HealthAlert 조회
exports.getUserAlerts = async (req, res) => {
  const { userId } = req.params;
  try {
    const alerts = await HealthAlert.findAll({
      where: { user_id: userId },
      order: [['detected_at', 'DESC']],
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
