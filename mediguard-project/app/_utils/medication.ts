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

export type OcrItemSnake = {
  med_nm: string;          // 약 이름
  dosage: string;          // 회당 복용량 (소수 가능, "0.25")
  times_per_day: string;   // 일 복용 횟수 (정수 문자열)
  duration_days: string;   // 복약 일수 (정수 문자열)
  morning: boolean;
  lunch: boolean;
  dinner: boolean;
};

const toNum = (s: string) => {
  const n = Number(String(s).trim());
  return Number.isFinite(n) ? n : 0;
};

export async function postOcrMedications(items: OcrItemSnake[]) {
  const user_id = await getUserId();
  if (!user_id) throw new Error('로그인이 필요합니다.');

  // ✅ 서버 컬럼명 그대로 전송
  const payload = {
    user_id,
    items: items.map((it) => ({
      med_nm: it.med_nm,
      dosage: toNum(it.dosage),                 // 0.25 OK
      times_per_day: toNum(it.times_per_day),
      duration_days: toNum(it.duration_days),
      morning: !!it.morning,
      lunch:   !!it.lunch,
      dinner:  !!it.dinner,
    })),
  };

  console.log('[OCR:REQ] /medication/ocr payload =', JSON.stringify(payload));

  try {
    const res = await postJSON<any>('/medication/ocr', payload);
    let ok = 0, fail = 0;
    if (typeof res?.ok === 'number') {
      ok = res.ok;
      fail = typeof res?.fail === 'number' ? res.fail : Math.max(0, payload.items.length - ok);
    } else if (typeof res?.inserted === 'number') {
      ok = res.inserted;
      fail = Math.max(0, payload.items.length - ok);
    } else if (Array.isArray(res?.results)) {
      ok = res.results.filter((r: any) => r?.success).length;
      fail = res.results.length - ok;
    } else {
      ok = payload.items.length;
      fail = 0;
    }
    return { ok, fail, firstErrorMessage: res?.message as string | undefined };
  } catch (err: any) {
    const msg = isAxiosError(err) ? getErrorMessage(err) : err?.message;
    console.warn('[OCR:ERR] bulk failed → fallback to per-item. reason =', msg);

    let ok = 0, fail = 0, firstErrorMessage: string | undefined;
    const results = await Promise.allSettled(
      payload.items.map((p) => postJSON<{ message: string; insertId?: number }>(
        '/medication/ocr',
        { user_id, ...p }
      ))
    );
    for (const r of results) {
      if (r.status === 'fulfilled') ok += 1;
      else {
        fail += 1;
        if (!firstErrorMessage) {
          const e = r.reason as any;
          firstErrorMessage = isAxiosError(e) ? getErrorMessage(e, '저장 실패') : (e?.message as string) || '저장 실패';
        }
      }
    }
    return { ok, fail, firstErrorMessage };
  }
}

/** ==========================================
 * 3) 복약 시간 설정 조회 / 존재 여부 확인
 * ========================================== */
export type MealTimeReadResponse = {
  morning: string | null;
  lunch: string | null;
  dinner: string | null;
};

export async function fetchMealTime(): Promise<MealTimeReadResponse> {
  const user_id = await getUserId();
  if (!user_id) throw new Error('로그인이 필요합니다.');
  return await postJSON<MealTimeReadResponse>('/medication/time/read', { user_id });
}

/** ==========================================
 * 4) 복약 정보 조회 (컬럼명 그대로 수신)
 * ========================================== */
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
  const res = await postJSON<{ data: MedRow[] }>('/medication/ocr/read', { user_id });
  return Array.isArray((res as any)?.data) ? (res as any).data as MedRow[] : (res as any);
}

/** 복약 시간 설정이 하나라도 있으면 true */
export async function hasMealTime(): Promise<boolean> {
  try {
    const t = await fetchMealTime();
    return Boolean(t?.morning || t?.lunch || t?.dinner);
  } catch {
    return false;
  }
}