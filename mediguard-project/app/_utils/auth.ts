// app/_utils/auth.ts
import * as SecureStore from 'expo-secure-store';
import {
  getJSON,
  postJSON,
  setAccessToken,   // api.ts의 SecureStore 토큰 헬퍼 재사용
  clearAccessToken, // api.ts의 SecureStore 토큰 헬퍼 재사용
} from './api';

/** =========================
 * Endpoints (계약)
 * ========================= */
const EP = {
  CHECK_ID: '/users/check-id',
  SIGNUP: '/users/signup',
  LOGIN: '/users/login', 
} as const;

export type CalendarType = '양력' | '음력';
export type Gender = '남성' | '여성';

export type SignUpPayload = {
  elder_nm: string;
  user_id: string;
  user_pw: string;
  guard_mail: string;
  elder_birth: string;     // "YYYY-MM-DD"
  birth_type: CalendarType;
  sex: Gender;
};

export type SignUpResponse = {
  message: string;
  user_id?: string;
};

/** 로그인 요청 바디 (프런트 내부 용) */
export type LoginBody = {
  id: string;
  password: string;
};

/** 서버 응답을 폭넓게 수용하도록 타입 유연화 */
export type LoginResponse = {
  ok?: boolean;
  message?: string;

  // 토큰 필드 (서버가 어떤 키를 쓰든 대응)
  token?: string;
  access_token?: string;

  // 유저 정보
  user_id?: string;
  elder_nm?: string;

  // 기타 확장 가능 필드
  [k: string]: any;
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
  const data = await getJSON<{ available: boolean; message: string }>(EP.CHECK_ID, {
    params: { user_id: userId },
  });
  return !!data.available;
}

/** 회원가입
 * - 서버 응답의 user_id 저장(없으면 payload.user_id)
 * - 역할(is_elderly)은 앱 내 별도 화면에서 user.ts로 관리
 */
export async function signUp(payload: SignUpPayload): Promise<SignUpResponse> {
  const data = await postJSON<SignUpResponse>(EP.SIGNUP, payload);
  const serverUserId = data?.user_id ?? payload.user_id;
  if (serverUserId) {
    await setUserId(serverUserId);
  }
  return data;
}

/** =========================
 * 자격 검증 전용(재인증용)
 * - 토큰/스토리지 변경 없이 성공/실패만 반환
 * - 백엔드: POST /auth/login { user_id, user_pw, validate_only: true }
 * ========================= */
export async function verifyCredentials(user_id: string, user_pw: string): Promise<boolean> {
  try {
    const res = await postJSON<LoginResponse>(EP.LOGIN, {
      user_id,
      user_pw,
      validate_only: true, // ✅ 검증만
    });

    // 선호: ok 필드로 판정
    if (typeof res?.ok === 'boolean') return res.ok;

    // 혹시 서버가 ok 없이 200만 주는 경우 대비(권장X)
    // validate_only 모드인데 토큰을 주는 건 백엔드 버그지만, 방어적으로 true 처리 가능
    if (res?.token || res?.access_token) return true;

    return false;
  } catch {
    return false;
  }
}

/** 로그인
 * - 토큰 저장
 * - user_id 저장(서버 없으면 입력 id)
 * - 역할(is_elderly) 비사용: 앱 내 선택 화면에서 user.ts로 관리
 */
export async function login(body: LoginBody): Promise<LoginResponse> {
  const payload = { user_id: body.id, user_pw: body.password };
  const data = await postJSON<LoginResponse>(EP.LOGIN, payload);

  // 서버가 token 또는 access_token 어떤 키를 쓰든 수용
  const token = data.token ?? data.access_token;
  if (token) {
    await setAccessToken(token);
  }

  const finalUserId = data.user_id ?? body.id;
  if (finalUserId) {
    await setUserId(finalUserId);
  }

  return data;
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  await clearAccessToken();
  await clearUserId();
}

/** 선택: 로그인 상태 간단 체크 */
export async function isLoggedIn(): Promise<boolean> {
  const uid = await getUserId();
  return !!uid;
}
