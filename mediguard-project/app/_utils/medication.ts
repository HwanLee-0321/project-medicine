// app/_utils/medication.ts
import { getUserId } from './auth';
import { postJSON, getErrorMessage, isAxiosError } from './api';

/** 식사(복약) 시간 저장 */
type MealTimePayload = {
  user_id: string;
  morning: string; // "HH:mm"
  lunch: string;   // "HH:mm"
  dinner: string;  // "HH:mm"
};

export async function postMealTime(times: Omit<MealTimePayload, 'user_id'>) {
  const user_id = await getUserId();
  if (!user_id) throw new Error('로그인이 필요합니다.');

  // ✅ postJSON은 res.data를 바로 반환 (자동 페일오버 + Toast 내장)
  return await postJSON<{ message: string }>('/medication/time', {
    user_id,
    ...times,
  });
}

/** OCR 입력(약 정보) 저장 - 여러 행을 개별 insert */
type OcrItem = {
  name: string;        // med_nm
  dosage: string;      // number string
  timesPerDay: string; // number string
  days: string;        // number string
};

export async function postOcrMedications(items: OcrItem[]) {
  const user_id = await getUserId();
  if (!user_id) throw new Error('로그인이 필요합니다.');

  // 백엔드 스키마 매핑 (+ 숫자 파싱 안전화)
  const toNum = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const payloads = items.map((it) => ({
    user_id,
    med_nm: it.name,
    dosage: toNum(it.dosage),
    times_per_day: toNum(it.timesPerDay),
    duration_days: toNum(it.days),
  }));

  let ok = 0;
  let fail = 0;
  let firstErrorMessage: string | undefined;

  // ✅ 병렬 저장 (allSettled로 개별 성공/실패 모두 집계)
  const results = await Promise.allSettled(
    payloads.map((p) =>
      postJSON<{ message: string; insertId: number }>('/medication/ocr', p)
    )
  );

  for (const r of results) {
    if (r.status === 'fulfilled') {
      ok += 1;
    } else {
      fail += 1;
      if (!firstErrorMessage) {
        const err = r.reason;
        firstErrorMessage = isAxiosError(err)
          ? getErrorMessage(err, '저장 실패')
          : (err?.message as string) || '저장 실패';
      }
    }
  }

  return { ok, fail, firstErrorMessage };
}
