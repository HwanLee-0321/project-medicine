// app/_utils/user.ts
import * as SecureStore from 'expo-secure-store';
import { getUserId } from './auth';

export type UserRole = 'senior' | 'caregiver';

// 불리언 ↔ 역할 문자열
const toRoleString = (isElderly: boolean): UserRole => (isElderly ? 'senior' : 'caregiver');
const toBoolean = (role: UserRole | string | null): boolean => role === 'senior';

// ⚠️ SecureStore 키는 영문/숫자/".", "-", "_" 만 허용
// 사용자 ID에 허용되지 않는 문자가 있으면 "_"로 치환
const sanitizeKeyPart = (s: string) => s.replace(/[^A-Za-z0-9._-]/g, '_');

// ✅ 콜론(:) 제거
const ROLE_GLOBAL_KEY = 'role_global';
const makeRoleKey = (userId: string) => `role_${sanitizeKeyPart(userId)}`;

/** ---------------------------------------
 * 1) 디바이스 전역 역할 (로그인 전에도 사용)
 * -------------------------------------- */
export async function setRoleGlobal(isElderly: boolean): Promise<void> {
  await SecureStore.setItemAsync(ROLE_GLOBAL_KEY, toRoleString(isElderly));
}

export async function getRoleGlobal(): Promise<UserRole | null> {
  const v = await SecureStore.getItemAsync(ROLE_GLOBAL_KEY);
  return (v as UserRole | null) ?? null;
}

export async function isElderlyGlobal(): Promise<boolean | null> {
  const role = await getRoleGlobal();
  return role ? toBoolean(role) : null;
}

export async function clearRoleGlobal(): Promise<void> {
  await SecureStore.deleteItemAsync(ROLE_GLOBAL_KEY);
}

/** ---------------------------------------
 * 2) 사용자별 역할 (로그인 이후 사용)
 * -------------------------------------- */
export async function setUserRoleLocal(isElderly: boolean): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');
  await SecureStore.setItemAsync(makeRoleKey(userId), toRoleString(isElderly));
}

export async function getUserRoleLocal(): Promise<UserRole | null> {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');
  const v = await SecureStore.getItemAsync(makeRoleKey(userId));
  return (v as UserRole | null) ?? null;
}

export async function isElderlyLocal(): Promise<boolean> {
  const role = await getUserRoleLocal();
  return toBoolean(role);
}

export async function clearUserRoleLocal(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await SecureStore.deleteItemAsync(makeRoleKey(userId));
}

/** ---------------------------------------
 * 3) 우선순위: 사용자별 > 전역 > null
 * -------------------------------------- */
export async function getEffectiveRole(): Promise<UserRole | null> {
  try {
    const userScoped = await getUserRoleLocal(); // 로그인 전이면 throw
    if (userScoped) return userScoped;
  } catch {
    // 로그인 전이면 무시
  }
  return await getRoleGlobal();
}

export async function isElderlyEffective(): Promise<boolean | null> {
  const role = await getEffectiveRole();
  return role ? toBoolean(role) : null;
}
