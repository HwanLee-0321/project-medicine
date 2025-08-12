// app/utils/auth.ts
import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export type CalendarType = '양력' | '음력';
export type Gender = '남성' | '여성';

/** 프론트에서 백엔드 컬럼명으로 그대로 보낼 회원가입 페이로드 */
export type SignUpPayload = {
  elder_nm: string;         // ← 이름
  user_id: string;          // ← 아이디
  user_pw: string;          // ← 비밀번호
  guard_mail: string;       // ← 보호자 이메일
  elder_birth: string;      // ← 생년월일(YYYY-MM-DD)
  birth_type: CalendarType; // ← 달력 종류
  sex: Gender;              // ← 성별
  is_elderly: boolean;      // ← 고령자 여부(백엔드 필수라면 true 고정 가능)
};

/** 회원가입 응답(백엔드가 message만 주므로, 화면 편의를 위해 echoName을 함께 전달) */
export type SignUpResponse = {
  message: string;   // ex) '회원가입 성공'
  echoName: string;  // payload.elder_nm 그대로 돌려줌 (UI에서 `${echoName}님` 용도)
};

/** 로그인 바디/응답 */
export type LoginBody = {
  id: string;
  password: string;
};
export type LoginResponse = {
  message: string;
  token: string;
};

/** 8자리(YYYYMMDD)를 YYYY-MM-DD로 보정 */
export function normalizeBirthdate(input: string) {
  const d = input.replace(/\D/g, '');
  if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  return input;
}

/** 아이디 중복 확인: true면 사용 가능
 *  백엔드 라우트 예시: GET /api/users/check-id?id=foo  → { data: { available: true } }
 *  ※ 아직 라우트가 없다면 404가 발생합니다.
 */
export async function checkDuplicateId(userId: string): Promise<boolean> {
  const res = await api.get<{ available: boolean; message: string }>('/users/check-id', {
    params: { user_id: userId }, // ★ 여기!
  });
  return !!res.data.available;
}

/** 회원가입
 *  백엔드: POST /api/users/signup
 *  프론트에서 이미 백엔드 컬럼명으로 매핑된 payload를 그대로 전송
 *  응답: { message: '회원가입 성공' } 만 오므로, echoName에 payload.elder_nm을 함께 반환
 */
export async function signUp(payload: SignUpPayload): Promise<SignUpResponse> {
  const res = await api.post<{ message: string }>('/users/signup', payload);
  return { message: res.data.message, echoName: payload.elder_nm };
}

/** 로그인
 *  백엔드: POST /api/users/login
 *  요청 바디 매핑:
 *   - user_id ← id
 *   - user_pw ← password
 *  응답: { message, token }
 *  저장: SecureStore('accessToken') → api.ts 인터셉터가 자동으로 Authorization 첨부
 */
export async function login(body: LoginBody): Promise<LoginResponse> {
  const payload = { user_id: body.id, user_pw: body.password };
  const res = await api.post<LoginResponse>('/users/login', payload);

  const { token, message } = res.data;
  await SecureStore.setItemAsync('accessToken', token);

  return { message, token };
}

/** 로그아웃: 저장 토큰 제거 */
export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync('accessToken');
}
