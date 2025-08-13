// app/utils/user.ts
import { api } from './api';
import { getUserId } from './auth';

/**
 * 사용자 역할 저장 (is_elderly)
 * - isElderly: true(고령자), false(보호자)
 * - 서버에는 0/1 숫자로 전송 (백엔드 Boolean 처리 가능)
 */
export async function setUserRole(isElderly: boolean) {
  const user_id = await getUserId();
  if (!user_id) throw new Error('로그인이 필요합니다.');

  const payload = { user_id, is_elderly: isElderly ? 1 : 0 };

  // 백엔드 라우트: POST /api/users/role  → { message }
  const res = await api.post<{ message: string }>('/users/role', payload);
  return res.data; // { message }
}
