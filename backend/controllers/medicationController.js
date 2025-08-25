const Medications = require('../db/Medications');
const MedicationSchedule = require('../db/Medication_schedule');
const MealTime = require('../db/Meal_time');

// 대문자/소문자/다른 키명까지 모두 안정적으로 흡수하는 정규화 함수
function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const name =
    raw.name ??
    raw.med_nm ??
    raw.MED_NM ??
    '';

  const dosage =
    raw.dosage ??
    raw.DOSAGE ??
    raw.dose ??
    raw.DOSE ??
    null;

  const timesPerDay =
    raw.timesPerDay ??
    raw.times_per_day ??
    raw.TIMES_PER_DAY ??
    null;

  const days =
    raw.days ??
    raw.duration_days ??
    raw.DURATION_DAYS ??
    null;

  const nDosage = dosage === '' || dosage == null ? NaN : Number(dosage);
  const nTimes  = timesPerDay === '' || timesPerDay == null ? NaN : Number(timesPerDay);
  const nDays   = days === '' || days == null ? NaN : Number(days);

  return {
    med_nm: String(name ?? '').trim(),
    dosage: Number.isFinite(nDosage) ? nDosage : NaN,
    times_per_day: Number.isFinite(nTimes) ? nTimes : NaN,
    duration_days: Number.isFinite(nDays) ? nDays : NaN,
  };
}

// OCR 데이터 여러 항목 저장 처리 (배열)
const handleOCRData = async (req, res) => {
  const { user_id, items } = req.body;

  if (!user_id) return res.status(400).json({ message: 'user_id required' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items required' });
  }

  let ok = 0, fail = 0, firstErrorMessage = null;

  for (const raw of items) {
    const it = normalizeItem(raw);
    if (!it || !it.med_nm || Number.isNaN(it.dosage) || Number.isNaN(it.times_per_day) || Number.isNaN(it.duration_days)) {
      fail++;
      if (!firstErrorMessage) firstErrorMessage = '유효하지 않은 항목이 있습니다.';
      continue;
    }

    try {
      const result = await Medications.create({
        user_id,
        med_nm: it.med_nm,
        dosage: it.dosage,
        times_per_day: it.times_per_day,
        duration_days: it.duration_days,
      });
      ok++;
    } catch (err) {
      fail++;
      if (!firstErrorMessage) firstErrorMessage = err.message;
    }
  }

  return res.json({ ok, fail, firstErrorMessage });
};


// 복약 스케줄 저장 처리
const handleSchedule = async (req, res) => {
  const { user_id, med_nm, dosage, scheduled_date, scheduled_time, status, taken_time } = req.body;

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
      status: status || 'n',
      taken_time: taken_time || null,
    });

    return res.status(200).json({ message: "복약 스케줄 저장 성공", insertId: result.id });
  } catch (err) {
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
};


// 복약 시간 정보 저장 및 수정 처리
const mealTime = async (req, res) => {
  const { user_id, morning, lunch, dinner } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "❌ user_id는 필수입니다" });
  }

  try {
    const existing = await MealTime.findOne({ where: { user_id } });

    if (existing) {
      await MealTime.update(
        { morning, lunch, dinner },
        { where: { user_id } }
      );
      return res.status(200).json({ message: "복약 시간 정보가 업데이트 되었습니다." });
    } else {
      await MealTime.create({ user_id, morning, lunch, dinner });
      return res.status(201).json({ message: "복약 시간 정보가 저장되었습니다." });
    }
  } catch (err) {
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
};


module.exports = {
  handleOCRData,
  handleSchedule,
  mealTime
};
