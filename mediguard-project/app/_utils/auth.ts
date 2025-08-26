// app/_utils/auth.ts
import * as SecureStore from 'expo-secure-store';
import {
  getJSON,
  postJSON,
  setAccessToken,   // api.ts의 SecureStore 토큰 헬퍼 재사용
  clearAccessToken, // api.ts의 SecureStore 토큰 헬퍼 재사용
} from './api';

export type CalendarType = '양력' | '음력';
export type Gender = '남성' | '여성';

export type SignUpPayload = {
  elder_nm: string;
  user_id: string;
  user_pw: string;
  guard_mail: string;
  elder_birth: string;     // "YYYY-MM-DD" 권장 (normalizeBirthdate로 변환 가능)
  birth_type: CalendarType;
  sex: Gender;
};

export type SignUpResponse = {
  message: string;
  user_id?: string;
};

export type LoginBody = {
  id: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user_id?: string;
  elder_nm?: string;
};

/** ---- SecureStore Keys ---- */
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

/** 8자리(YYYYMMDD) -> YYYY-MM-DD */
export function normalizeBirthdate(input: string) {
  const d = input.replace(/\D/g, '');
  if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  return input;
}

/** 아이디 중복 확인 */
export async function checkDuplicateId(userId: string): Promise<boolean> {
  // getJSON은 res.data를 바로 반환하므로 .data 없이 바로 사용
  const data = await getJSON<{ available: boolean; message: string }>('/users/check-id', {
    params: { user_id: userId },
  });
  return !!data.available;
}

/** 회원가입
 * - 서버 응답의 user_id 저장(없으면 payload.user_id)
 * - 역할(is_elderly)은 백엔드 비제공, 앱 내 별도 화면에서 user.ts로 관리
 */
export async function signUp(payload: SignUpPayload): Promise<SignUpResponse> {
  const data = await postJSON<SignUpResponse>('/users/signup', payload);

  const serverUserId = data?.user_id ?? payload.user_id;
  if (serverUserId) {
    await setUserId(serverUserId);
  }

  return data;
}

/** 로그인
 * - 토큰 저장
 * - user_id 저장(서버 없으면 입력 id)
 * - 역할(is_elderly) 비사용: 앱 내 선택 화면에서 user.ts로 관리
 */
export async function login(body: LoginBody): Promise<LoginResponse> {
  const payload = { user_id: body.id, user_pw: body.password };
  const data = await postJSON<LoginResponse>('/users/login', payload);

  if (data.token) {
    await setAccessToken(data.token);
  }

  const finalUserId = data.user_id ?? body.id;
  if (finalUserId) {
    await setUserId(finalUserId);
  }

  return data;
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  await clearAccessToken(); // api.ts의 토큰 삭제 재사용
  await clearUserId();
}

/** 선택: 로그인 상태 간단 체크 */
export async function isLoggedIn(): Promise<boolean> {
  const uid = await getUserId();
  // 토큰은 api.ts에서 관리하지만, 여기서는 user_id만으로도 1차 판단 가능
  return !!uid;
}
