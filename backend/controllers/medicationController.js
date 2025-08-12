const Medications = require('../db/Medications');
const MedicationSchedule = require('../db/Medication_schedule');
const MealTime = require('../db/Meal_time');

// OCR 데이터 저장 처리
const handleOCRData = async (req, res) => {
  const { user_id, med_nm, dosage, times_per_day, duration_days } = req.body;

  // 필수 데이터 확인
  if (!user_id || !med_nm || !dosage || !times_per_day || !duration_days) {
    return res.status(400).json({ message: "❌ 필수 항목 누락" });  // 400: Bad Request
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
    res.status(200).json({ message: "저장 성공", insertId: result.id });  // 200: OK
  } catch (err) {
    console.error("❌ Sequelize 저장 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });  // 500: Internal Server Error
  }
};

const handleSchedule = async (req, res) => {
  const { user_id, med_nm, dosage, scheduled_date, scheduled_time, status, taken_time } = req.body;

  // 필수 데이터 확인 (상태(status)와 복용시간(taken_time)은 옵션일 수도 있으니 필수는 아님)
  if (!user_id || !med_nm || !dosage || !scheduled_date || !scheduled_time) {
    return res.status(400).json({ message: "❌ 필수 항목 누락" });  // 400: Bad Request
  }

  try {
    const result = await MedicationSchedule.create({
      user_id,
      med_nm,
      dosage,
      scheduled_date,
      scheduled_time,
      status: status || 'n', // 상태가 없으면 기본값 'n' (not taken)
      taken_time: taken_time || null,
    });

    console.log("✅ 복약 스케줄 저장 성공, 삽입된 ID:", result.id);
    res.status(200).json({ message: "복약 스케줄 저장 성공", insertId: result.id });  // 200: OK
  } catch (err) {
    console.error("❌ Sequelize 저장 오류:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });  // 500: Internal Server Error
  }
};

// 복약 시간 저장
const mealTime = async (req, res) => {
  const { user_id, morning, lunch, dinner } = req.body;

  // 필수 항목 체크 (user_id는 필수, 시간은 옵션일 수 있음)
  if (!user_id) {
    return res.status(400).json({ message: "❌ user_id는 필수입니다" });
  }

  try {
    // 이미 user_id에 해당하는 레코드가 있는지 확인 (있으면 update, 없으면 insert)
    const existing = await MealTime.findOne({ where: { user_id } });

    if (existing) {
      // 기존 레코드가 있으면 업데이트
      await MealTime.update(
        { morning, lunch, dinner },
        { where: { user_id } }
      );
      return res.status(200).json({ message: "복약 시간 정보가 업데이트 되었습니다." });
    } else {
      // 없으면 새로 생성
      await MealTime.create({ user_id, morning, lunch, dinner });
      return res.status(201).json({ message: "복약 시간 정보가 저장되었습니다." });
    }
  } catch (err) {
    console.error("❌ Sequelize 저장 오류:", err);
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

module.exports = {
  handleOCRData,
  handleSchedule,
  mealTime
};
