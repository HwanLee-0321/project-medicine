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
  birth_type: CalendarType;
  sex: Gender;
  is_elderly: boolean;
};

export type SignUpResponse = {
  message: string;
  echoName: string;
};

export type LoginBody = {
  id: string;
  password: string;
};
export type LoginResponse = {
  message: string;
  token: string;
};

/** ---- SecureStore Keys ---- */
const ACCESS_TOKEN_KEY = 'accessToken';
const USER_ID_KEY = 'user_id';

/** ---- user_id 저장/조회 ---- */
export async function setUserId(userId: string) {
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
}
export async function getUserId() {
  return SecureStore.getItemAsync(USER_ID_KEY);
}

/** ---- access token 저장/삭제(참고) ---- */
export async function setAccessToken(token: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
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

/** 회원가입 */
export async function signUp(payload: SignUpPayload): Promise<SignUpResponse> {
  const res = await api.post<{ message: string }>('/users/signup', payload);
  // 회원가입 직후 user_id 저장
  await setUserId(payload.user_id);
  return { message: res.data.message, echoName: payload.elder_nm };
}

/** 로그인 */
export async function login(body: LoginBody): Promise<LoginResponse> {
  const payload = { user_id: body.id, user_pw: body.password };
  const res = await api.post<LoginResponse>('/users/login', payload);
  const { token, message } = res.data;

  await setAccessToken(token);
  // 로그인한 계정 id를 보관 (백엔드가 따로 주지 않아도 프론트 입력값으로 저장)
  await setUserId(body.id);

  return { message, token };
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}
