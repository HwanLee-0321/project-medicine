// app/utils/api.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

/** =========================================
 * Base URL Resolver
 * 우선순위: ENV -> app.json extra.baseURL -> fallback
 * /api 중복 방지 처리
 * ========================================= */
const getBaseURL = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const fromConfig = (Constants.expoConfig?.extra as any)?.baseURL as string | undefined;

  // ⚠️ 실제 단말 테스트 시 로컬 PC IP로 교체 필요
  const fallback = 'http://192.168.111.218:3000';

  const base = (fromEnv || fromConfig || fallback).replace(/\/+$/, ''); // 끝 슬래시 제거
  // 이미 /api로 끝나면 유지, 아니면 /api 추가
  return /\/api$/.test(base) ? base : `${base}/api`;
};

const BASE_URL = getBaseURL();

/** =========================================
 * Axios Instance
 * ========================================= */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/** =========================================
 * Token Helpers (SecureStore)
 * ========================================= */
const ACCESS_TOKEN_KEY = 'accessToken';

export async function setAccessToken(token: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}
export async function clearAccessToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

/** =========================================
 * Interceptors
 * - Request: Authorization 자동 주입
 * - Response: 공통 에러 전달
 * - DEV 모드에서 요청/응답 로그
 * ========================================= */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    } catch {
      // SecureStore 미사용 환경에서도 조용히 통과
    }

    if (__DEV__) {
      // 요청 로그 (개발 모드)
      // eslint-disable-next-line no-console
      console.log(
        `[API:REQ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        { params: config.params, data: config.data }
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res: AxiosResponse) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[API:RES] ${res.status} ${res.config.url}`, res.data);
    }
    return res;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[API:ERR]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    // 여기서 401 시 토큰 갱신 로직 등을 넣을 수 있음(필요 시)
    return Promise.reject(error);
  }
);

/** =========================================
 * Types & Guards
 * ========================================= */
export type ApiResult<T> = { data: T; message?: string };

export const isAxiosError = (e: unknown): e is AxiosError => axios.isAxiosError(e);

export function getErrorMessage(e: unknown, fallback = '요청 중 문제가 발생했어요.') {
  if (axios.isAxiosError(e)) {
    const serverMsg =
      (e.response?.data as any)?.message ??
      (e.response?.data as any)?.error ??
      e.message;
    return serverMsg || fallback;
  }
  return fallback;
}

/** =========================================
 * Thin Wrappers (편의 함수)
 * - 성공 시 res.data를 바로 반환
 * - 제네릭으로 타입 지정 용이
 * ========================================= */
export async function getJSON<T>(url: string, config?: AxiosRequestConfig) {
  const res = await api.get<T>(url, config);
  return res.data;
}
export async function postJSON<T>(url: string, body?: any, config?: AxiosRequestConfig) {
  const res = await api.post<T>(url, body, config);
  return res.data;
}
export async function putJSON<T>(url: string, body?: any, config?: AxiosRequestConfig) {
  const res = await api.put<T>(url, body, config);
  return res.data;
}
export async function patchJSON<T>(url: string, body?: any, config?: AxiosRequestConfig) {
  const res = await api.patch<T>(url, body, config);
  return res.data;
}
export async function deleteJSON<T>(url: string, config?: AxiosRequestConfig) {
  const res = await api.delete<T>(url, config);
  return res.data;
}

/** =========================================
 * Export base URL (디버깅/표시용)
 * ========================================= */
export { BASE_URL };
