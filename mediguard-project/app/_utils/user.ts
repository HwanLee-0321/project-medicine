// app/_utils/user.ts
import * as SecureStore from 'expo-secure-store';
import { getUserId } from './auth';

/** ---------------------------------------
 * 공통 타입/헬퍼
 * -------------------------------------- */
export type UserRole = 'senior' | 'caregiver';

/** 불리언 ↔ 문자열 매핑 헬퍼 */
const toRoleString = (isElderly: boolean): UserRole =>
  isElderly ? 'senior' : 'caregiver';
const toBoolean = (role: UserRole | string | null): boolean =>
  role === 'senior';

/** ---------------------------------------
 * 1) 디바이스 전역 역할 (로그인 여부 무관)
 *    - 앱 첫 실행/로그인 전에도 사용 가능
 * -------------------------------------- */
const ROLE_GLOBAL_KEY = 'role:global';

export async function setRoleGlobal(isElderly: boolean): Promise<void> {
  await SecureStore.setItemAsync(ROLE_GLOBAL_KEY, toRoleString(isElderly));
}

export async function getRoleGlobal(): Promise<UserRole | null> {
  const v = await SecureStore.getItemAsync(ROLE_GLOBAL_KEY);
  return (v as UserRole | null) ?? null;
}

export async function isElderlyGlobal(): Promise<boolean | null> {
  const role = await getRoleGlobal();
  return role ? toBoolean(role) : null; // 전역에 아직 없을 수 있으므로 null 허용
}

export async function clearRoleGlobal(): Promise<void> {
  await SecureStore.deleteItemAsync(ROLE_GLOBAL_KEY);
}

/** ---------------------------------------
 * 2) 사용자별 역할 (여러 계정 사용 기기 대비)
 *    - 로그인 이후에만 사용(키 스코프: role:${userId})
 * -------------------------------------- */
const makeRoleKey = (userId: string) => `role:${userId}`;

export async function setUserRoleLocal(isElderly: boolean): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');
  await SecureStore.setItemAsync(makeRoleKey(userId), toRoleString(isElderly));
}

/** 현재 사용자 역할 조회 (디바이스 로컬) */
export async function getUserRoleLocal(): Promise<UserRole | null> {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');
  const v = await SecureStore.getItemAsync(makeRoleKey(userId));
  return (v as UserRole | null) ?? null;
}

/** 현재 사용자 역할이 고령자인지 여부(boolean) */
export async function isElderlyLocal(): Promise<boolean> {
  const role = await getUserRoleLocal();
  return toBoolean(role);
}

/** 현재 사용자 역할 삭제 (로그아웃 시 등) */
export async function clearUserRoleLocal(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await SecureStore.deleteItemAsync(makeRoleKey(userId));
}

/** ---------------------------------------
 * 3) 편의 API
 *    - 우선순위: 사용자별 역할 > 전역 역할 > null
 *    - 화면 진입 가드/분기 등에 유용
 * -------------------------------------- */
export async function getEffectiveRole(): Promise<UserRole | null> {
  try {
    const userScoped = await getUserRoleLocal(); // 로그인 안돼 있으면 throw
    if (userScoped) return userScoped;
  } catch {
    // 로그인 전인 경우 무시
  }
  return await getRoleGlobal();
}

export async function isElderlyEffective(): Promise<boolean | null> {
  const role = await getEffectiveRole();
  return role ? toBoolean(role) : null;
}
