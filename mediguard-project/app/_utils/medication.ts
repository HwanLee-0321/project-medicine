// app/_utils/medication.ts
import { api } from './api';
import { getUserId } from './auth';

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

  const res = await api.post<{ message: string }>('/medication/time', {
    user_id,
    ...times,
  });
  return res.data; // { message }
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

  // 백엔드 스키마 매핑
  const payloads = items.map((it) => ({
    user_id,
    med_nm: it.name,
    dosage: Number(it.dosage),
    times_per_day: Number(it.timesPerDay),
    duration_days: Number(it.days),
  }));

  let ok = 0;
  let fail = 0;
  let firstErrorMessage: string | undefined;

  // 병렬 저장
  await Promise.all(
    payloads.map(async (p) => {
      try {
        await api.post<{ message: string; insertId: number }>('/medication/ocr', p);
        ok += 1;
      } catch (e: any) {
        fail += 1;
        if (!firstErrorMessage) {
          firstErrorMessage =
            (e?.response?.data?.message as string) ||
            (e?.message as string) ||
            '저장 실패';
        }
      }
    })
  );

  return { ok, fail, firstErrorMessage };
}
