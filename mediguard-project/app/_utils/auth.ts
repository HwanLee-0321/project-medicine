// app/utils/auth.ts
import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export type CalendarType = '양력' | '음력';
export type Gender = '남성' | '여성';

export type SignUpPayload = {
  elder_nm: string;
  user_id: string;
  user_pw: string;
  guard_mail: string;
  elder_birth: string;
  birth_type: CalendarType; // 서버에서 Boolean/0|1로 변환 처리
  sex: Gender;              // 서버에서 Boolean/0|1로 변환 처리
  is_elderly: boolean;      // true/false 전송 (백엔드에서 Boolean 처리)
};

export type SignUpResponse = {
  message: string;
  user_id?: string;   // 서버가 함께 내려줄 것을 권장
};

export type LoginBody = {
  id: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user_id?: string;   // 서버가 함께 내려줄 것을 권장
  elder_nm?: string;
};

/** ---- SecureStore Keys ---- */
const ACCESS_TOKEN_KEY = 'accessToken';
const USER_ID_KEY = 'user_id';

/** ---- user_id 저장/조회/삭제 ---- */
export async function setUserId(userId: string) {
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
}
export async function getUserId() {
  return SecureStore.getItemAsync(USER_ID_KEY);
}
export async function clearUserId() {
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}

/** ---- access token 저장/삭제 ---- */
export async function setAccessToken(token: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}
export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}
export async function clearAccessToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

/** 8자리(YYYYMMDD) -> YYYY-MM-DD */
export function normalizeBirthdate(input: string) {
  const d = input.replace(/\D/g, '');
  if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  return input;
}

/** 아이디 중복 확인 */
export async function checkDuplicateId(userId: string): Promise<boolean> {
  const res = await api.get<{ available: boolean; message: string }>('/users/check-id', {
    params: { user_id: userId },
  });
  return !!res.data.available;
}

/** 회원가입
 *  서버 응답에 user_id가 있으면 그것을 저장, 없으면 payload.user_id로 폴백
 */
export async function signUp(payload: SignUpPayload): Promise<SignUpResponse> {
  const res = await api.post<SignUpResponse>('/users/signup', payload);
  const serverUserId = res.data?.user_id ?? payload.user_id;
  if (serverUserId) await setUserId(serverUserId);
  return res.data;
}

/** 로그인
 *  서버 응답의 user_id를 저장, 없으면 입력 id로 폴백
 */
export async function login(body: LoginBody): Promise<LoginResponse> {
  const payload = { user_id: body.id, user_pw: body.password };
  const res = await api.post<LoginResponse>('/users/login', payload);

  const { token, user_id: serverUserId } = res.data;
  if (token) await setAccessToken(token);

  const finalUserId = serverUserId ?? body.id;
  if (finalUserId) await setUserId(finalUserId);

  return res.data;
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  await clearAccessToken();
  await clearUserId();
}
