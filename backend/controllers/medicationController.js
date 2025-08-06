const Medications = require('../db/Medications');  // 모델 경로 맞게
const MedicationSchedule = require('../db/Medication_schedule')

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

const handleSchedule = async (req, res) => {
  const { user_id, med_nm, dosage, scheduled_date, scheduled_time, status, taken_time } = req.body;

  // 필수 데이터 확인 (상태(status)와 복용시간(taken_time)은 옵션일 수도 있으니 필수는 아님)
  if (!user_id || !med_nm || !dosage || !scheduled_date || !scheduled_time) {
    return res.status(400).json({ message: "❌ 필수 항목 누락" });
  }

  try {
    const result = await MedicationSchedule.create({
      user_id,
      med_nm,
      dosage,
      scheduled_date,
      scheduled_time,
      status: status || 'n', // 상태가 없으면 기본값 'n' (예: not taken)
      taken_time: taken_time || null,
    });

    console.log("✅ 복약 스케줄 저장 성공, 삽입된 ID:", result.id);
    res.status(200).json({ message: "복약 스케줄 저장 성공", insertId: result.id });
  } catch (err) {
    console.error("❌ Sequelize 저장 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

module.exports = {
  handleOCRData,
  handleSchedule
};
