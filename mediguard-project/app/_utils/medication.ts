// app/_utils/medication.ts
import { getUserId } from './auth';
import { postJSON, getErrorMessage, isAxiosError } from './api';

/** ================================
 * 1) 복약 시간(식사 시간) 저장
 * ================================ */

type MealTimePayload = {
  user_id: string;
  morning: string; // "HH:mm"
  lunch: string;   // "HH:mm"
  dinner: string;  // "HH:mm"
};

export async function postMealTime(times: Omit<MealTimePayload, 'user_id'>) {
  const user_id = await getUserId();
  if (!user_id) throw new Error('로그인이 필요합니다.');

  return await postJSON<{ message: string }>('/medication/time', {
    user_id,
    ...times,
  });
}

/** ==========================================
 * 2) 약 정보 저장 - 여러 행 개별 insert
 * ========================================== */

type OcrItem = {
  name: string;        // med_nm
  dosage: string;      // number string
  timesPerDay: string; // number string
  days: string;        // number string
  morning: boolean;    // ✅ 추가
  lunch: boolean;      // ✅ 추가
  dinner: boolean;     // ✅ 추가
};

export async function postOcrMedications(items: OcrItem[]) {
  const user_id = await getUserId();
  if (!user_id) throw new Error('로그인이 필요합니다.');

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
    morning: !!it.morning,
    lunch: !!it.lunch,
    dinner: !!it.dinner,
  }));

  let ok = 0;
  let fail = 0;
  let firstErrorMessage: string | undefined;

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
        const err = r.reason as any;
        firstErrorMessage = isAxiosError(err)
          ? getErrorMessage(err, '저장 실패')
          : (err?.message as string) || '저장 실패';
      }
    }
  }

  return { ok, fail, firstErrorMessage };
}

/** ==========================================
 * 3) 복약 시간 설정 조회 / 존재 여부 확인
 * ========================================== */

export type MealTimeReadResponse = {
  morning: string | null;
  lunch: string | null;
  dinner: string | null;
}

/** 복약 시간 설정 조회 */
export async function fetchMealTime(): Promise<MealTimeReadResponse> {
  const user_id = await getUserId();
  if (!user_id) throw new Error('로그인이 필요합니다.');

  // ✅ 서버에서 상세값을 반환하는 엔드포인트
  return await postJSON<MealTimeReadResponse>('/medication/time/read', { user_id });
}

/** ==========================================
 * 4) 복약 정보 조회
 * ========================================== */

export type Bool3 = {
  morning: boolean;
  lunch: boolean;
  dinner: boolean;
};

export type MedRow = {
  med_nm: string;
  dosage: number;
  times_per_day: number;
  duration_days: number;
  morning: boolean;
  lunch: boolean;
  dinner: boolean;
};

export async function readOcrMedications(): Promise<MedRow[]> {
  const user_id = await getUserId();
  if (!user_id) throw new Error('로그인이 필요합니다.');

  // ✅ 서버가 POST body로 user_id를 받는 경우
  const res = await postJSON<{ data: MedRow[] }>('/medication/ocr/read', { user_id });
  // 만약 서버 응답이 { data: [...] } 형태가 아니라면 아래 한 줄을 적절히 수정
  return Array.isArray((res as any)?.data) ? (res as any).data as MedRow[] : (res as any);
}

/** 복약 시간 설정이 하나라도 있으면 true */
export async function hasMealTime(): Promise<boolean> {
  try {
    const t = await fetchMealTime();
    if (!t) return false;
    return Boolean(t.morning || t.lunch || t.dinner);
  } catch {
    return false;
  }
}
