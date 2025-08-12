// app/utils/medication.ts
import { api } from './api';
import { getUserId } from './auth';

type MealTimePayload = {
  user_id: string;
  morning: string; // "HH:mm"
  lunch: string;   // "HH:mm"
  dinner: string;  // "HH:mm"
};

/** 복약(아침/점심/저녁) 시간 저장 */
export async function postMealTime(times: Omit<MealTimePayload, 'user_id'>) {
  const user_id = await getUserId();
  if (!user_id) throw new Error('로그인이 필요합니다.');

  const res = await api.post<{ message: string }>('/medication/time', {
    user_id,
    ...times,
  });
  return res.data; // { message }
}
