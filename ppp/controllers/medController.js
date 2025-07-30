const db = require('../models/db');

exports.recordMedicationIntake = async (req, res) => {
  const { user_id, scheduled_time, taken_time, medicine_name } = req.body;

  if (!user_id || !scheduled_time || !taken_time || !medicine_name) {
    return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
  }

  try {
    const sql = `
      INSERT INTO medication_schedule (user_id, scheduled_time, taken_time, medicine_name)
      VALUES (?, ?, ?, ?)
    `;
    const values = [user_id, scheduled_time, taken_time, medicine_name];

    await db.execute(sql, values);
    res.status(201).json({ message: '복약 기록이 저장되었습니다.' });
  } catch (error) {
    console.error('DB 오류:', error);
    res.status(500).json({ error: '서버 오류로 인해 저장에 실패했습니다.' });
  }
};
