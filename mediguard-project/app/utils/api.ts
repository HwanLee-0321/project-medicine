// app/utils/api.ts
import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

/**
 * 환경에 따라 API 기본 URL을 가져오는 함수.
 * 1. 환경 변수 (EXPO_PUBLIC_API_BASE_URL)
 * 2. app.json의 extra.baseURL
 * 3. 기본 로컬 개발 URL (http://192.168.111.218:3000)
 * 위 순서대로 우선순위를 가집니다.
 */
const getBaseURL = (): string => {
  // Expo의 app.json에 설정된 extra.baseURL 값을 가져옵니다.
  const fromConfig = Constants.expoConfig?.extra?.baseURL as string | undefined;

  // 개발 환경에 따라 바뀌는 URL을 위해, 하드코딩 대신 환경 변수를 사용합니다.
  // 이 변수는 package.json 스크립트에서 설정할 수 있습니다.
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;

  // 우선순위에 따라 URL을 반환합니다.
  const baseURL = fromEnv || fromConfig || 'http://192.168.111.218:3000';

  // URL이 /api로 끝나지 않으면 추가해줍니다.
  return baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
};

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 요청 인터셉터: 액세스 토큰 자동 첨부
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // SecureStore가 없는 환경에서도 오류 없이 작동하도록 합니다.
  }
  return config;
});

// 응답 인터셉터: 공통 에러 핸들링
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 서버 응답 타입 정의
export type ApiResult<T> = { data: T; message?: string };

// Axios 에러 타입 가드
export const isAxiosError = (e: unknown): e is AxiosError => axios.isAxiosError(e);

// 에러 메시지 추출
export function getErrorMessage(e: unknown, fallback = '요청 중 문제가 발생했어요.') {
  if (axios.isAxiosError(e)) {
    const msg = (e.response?.data as any)?.message ?? e.message;
    return msg || fallback;
  }
  return fallback;
}
