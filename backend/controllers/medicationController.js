const Medications = require('../db/Medications');  // 모델 경로 맞게

// OCR 데이터 저장 처리
const handleOCRData = async (req, res) => {
  const { user_id, med_nm, dosage, times_per_day, duration_days } = req.body;

  // 필수 데이터 확인
  if (!user_id || !med_nm || !dosage || !times_per_day || !duration_days) {
    return res.status(400).json({ message: "❌ 필수 항목 누락" });
  }

  try {
    const result = await Medications.create({
      user_id,
      med_nm,
      dosage,
      times_per_day,
      duration_days
    });

    console.log("✅ 저장 성공, 삽입된 ID:", result.id);
    res.status(200).json({ message: "저장 성공", insertId: result.id });
  } catch (err) {
    console.error("❌ Sequelize 저장 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

module.exports = {
  handleOCRData
};
