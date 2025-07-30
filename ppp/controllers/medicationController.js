const db = require('../models/db');

// OCR 데이터 저장 처리
const handleOCRData = async (req, res) => {
  const { user_id, name, times_per_day, duration_days } = req.body;

  // 필수 데이터 확인
  if (!user_id || !name || !times_per_day || !duration_days) {
    return res.status(400).json({ message: "❌ 필수 항목 누락" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO medications (user_id, name, times_per_day, duration_days)
       VALUES (?, ?, ?, ?)`,
      [user_id, name, times_per_day, duration_days]
    );

    console.log("✅ 저장 성공, 삽입된 ID:", result.insertId);
    res.status(200).json({ message: "저장 성공", insertId: result.insertId });
  } catch (err) {
    console.error("❌ MySQL 저장 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

module.exports = {
  handleOCRData
};
