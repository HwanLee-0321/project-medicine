// app/_utils/user_service.ts
import { getJSON, postJSON } from './api';
import { getUserId } from './auth';

export type MealTimes = { morning?: string; lunch?: string; dinner?: string };
export type MedicationItem = {
  name: string;
  dosage?: string;
  timesPerDay?: string;
  days?: string;
  morning?: boolean;
  lunch?: boolean;
  dinner?: boolean;
};

/** 이름: GET /users/:userId/name  (문자열 하나 반환) */
export async function fetchElderName(): Promise<string> {
  const uid = await getUserId();
  if (!uid) return '어르신';

  try {
    const s = await getJSON<string>(`/users/${encodeURIComponent(uid)}/name`);
    return (s ?? '').trim() || '어르신';
  } catch (e: any) {
    // (호환용) 혹시 서버가 query 형태만 열어뒀다면 한 번 더 시도
    try {
      const s = await getJSON<string>(`/users/name?user_id=${encodeURIComponent(uid)}`);
      return (s ?? '').trim() || '어르신';
    } catch {}
    console.log('[user_service] fetchElderName failed:', e?.response?.status, e?.message);
    return '어르신';
  }
}

/** 복약 시간표: GET /users/:userId/medication/time */
export async function fetchMealTimes(): Promise<MealTimes | null> {
  const uid = await getUserId();
  if (!uid) return null;

  try {
    return await getJSON<MealTimes>(`/users/${encodeURIComponent(uid)}/medication/time`);
  } catch (e: any) {
    // (호환용 소극적 Fallback) 과거 경로가 살아있다면
    try { return await getJSON<MealTimes>(`/medication/time/read?user_id=${encodeURIComponent(uid)}`); } catch {}
    try { return await getJSON<MealTimes>(`/medication/time?user_id=${encodeURIComponent(uid)}`); } catch {}
    console.log('[user_service] fetchMealTimes failed:', e?.response?.status, e?.message);
    return null;
  }
}

/** 복약 목록: GET /users/:userId/medications */
export async function fetchMedications(): Promise<MedicationItem[] | null> {
  const uid = await getUserId();
  if (!uid) return null;

  try {
    const raw = await getJSON<any>(`/users/${encodeURIComponent(uid)}/medications`);
    return normalizeMedications(raw);
  } catch (e: any) {
    // (호환용 소극적 Fallback)
    try { return normalizeMedications(await getJSON<any>(`/medication/ocr/read?user_id=${encodeURIComponent(uid)}`)); } catch {}
    try { return normalizeMedications(await getJSON<any>(`/medication/list?user_id=${encodeURIComponent(uid)}`)); } catch {}
    console.log('[user_service] fetchMedications failed:', e?.response?.status, e?.message);
    return null;
  }
}

function normalizeMedications(raw: any): MedicationItem[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    return raw
      .map((it: any) => (typeof it === 'string' ? { name: it } : { name: it?.name ?? '', ...it }))
      .filter((x: MedicationItem) => x.name);
  }
  if (Array.isArray(raw?.items)) {
    return raw.items
      .map((it: any) => (typeof it === 'string' ? { name: it } : { name: it?.name ?? '', ...it }))
      .filter((x: MedicationItem) => x.name);
  }
  return null;
}

/** 한 방에 로드 */
export async function loadElderContext() {
  const [elder_nm, meal, meds] = await Promise.all([
    fetchElderName(),
    fetchMealTimes(),
    fetchMedications(),
  ]);
  return { elder_nm, meal, meds };
}

/** 시간대 추론 (그대로 사용) */
export function inferSlotFromNow(meal?: MealTimes | null): 'morning' | 'lunch' | 'dinner' | 'unknown' {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const now = new Date();
  const hhmmNow = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const toNum = (s?: string) => (s && /^\d{2}:\d{2}$/.test(s) ? Number(s.slice(0,2))*60 + Number(s.slice(3)) : NaN);
  const n = toNum(hhmmNow), m = toNum(meal?.morning), l = toNum(meal?.lunch), d = toNum(meal?.dinner);

  const cand: Array<{k:'morning'|'lunch'|'dinner'; v:number}> = [];
  if (!isNaN(m)) cand.push({k:'morning', v:Math.abs(n-m)});
  if (!isNaN(l)) cand.push({k:'lunch',   v:Math.abs(n-l)});
  if (!isNaN(d)) cand.push({k:'dinner',  v:Math.abs(n-d)});
  if (cand.length) { cand.sort((a,b)=>a.v-b.v); return cand[0].k; }

  const h = now.getHours(); if (h < 11) return 'morning'; if (h < 17) return 'lunch'; return 'dinner';
}

/** 복약 확인 기록: POST /users/:userId/medication/confirm */
export async function confirmIntake(answer: boolean, meal?: MealTimes | null) {
  const user_id = await getUserId();
  if (!user_id) return { ok: false };
  const at = new Date().toISOString();
  const slot = inferSlotFromNow(meal);

  try {
    await postJSON(`/users/${encodeURIComponent(user_id)}/medication/confirm`, { answer, at, slot });
    return { ok: true };
  } catch (e: any) {
    // (호환용 Fallback) 현재 서버에 임시 라우트가 있다면 한 번 더
    try {
      await postJSON(`/medication/schedule`, { user_id, answer, at, slot });
      return { ok: true };
    } catch {}
    console.log('[user_service] confirmIntake failed:', e?.response?.status, e?.message);
    return { ok: false };
  }
}
