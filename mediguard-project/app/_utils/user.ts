// app/utils/user.ts
import * as SecureStore from 'expo-secure-store';
import { getUserId } from './auth';

/**
 * 로컬 저장 키를 사용자별로 스코프링
 * - 동일 단말에 여러 계정이 로그인했던 이력이 있어도 혼동 방지
 */
const makeRoleKey = (userId: string) => `role:${userId}`;

/** 타입: 앱에서 쓰기 편하도록 문자열 역할도 노출 */
export type UserRole = 'elderly' | 'caregiver';

/** 불리언 ↔ 문자열 매핑 헬퍼 */
const toRoleString = (isElderly: boolean): UserRole =>
  isElderly ? 'elderly' : 'caregiver';
const toBoolean = (role: UserRole | string | null): boolean =>
  role === 'elderly';

/**
 * 사용자 역할 저장 (디바이스 로컬)
 * - isElderly: true(고령자), false(보호자)
 * - 서버 저장/동기화 없음
 */
export async function setUserRoleLocal(isElderly: boolean): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');
  const key = makeRoleKey(userId);
  await SecureStore.setItemAsync(key, toRoleString(isElderly));
}

/** 현재 사용자 역할 조회 (디바이스 로컬) */
export async function getUserRoleLocal(): Promise<UserRole | null> {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');
  const key = makeRoleKey(userId);
  const v = await SecureStore.getItemAsync(key);
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
  const key = makeRoleKey(userId);
  await SecureStore.deleteItemAsync(key);
}
