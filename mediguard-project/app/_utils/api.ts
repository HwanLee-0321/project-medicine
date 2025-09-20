// app/_utils/api.ts
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

/** =========================================
 * Util: base URL normalize (끝에 /api 보정)
 * ========================================= */
const normalizeBase = (raw?: string | null) => {
  if (!raw) throw new Error('[API] baseURL is missing in app.json (expo.extra.baseURL)');
  const trimmed = raw.trim().replace(/\/+$/, '');
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
};
const safeNormalize = (raw?: string | null) => {
  try { return normalizeBase(raw); } catch { return undefined; }
};

/** =========================================
 * app.json(extra)에서 baseURL 읽기
 * ========================================= */
const extra: any =
  (Constants.expoConfig?.extra as any) ??
  ((Constants as any).manifest?.extra as any) ??
  {};
const BASE_URL = normalizeBase(extra?.baseURL as string | undefined);

/** =========================================
 * Axios instance (고정 서버)
 * ========================================= */
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/** =========================================
 * Token Helpers
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
 * ========================================= */
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token) {
        const headers = AxiosHeaders.from(config.headers);
        headers.set('Authorization', `Bearer ${token}`);
        config.headers = headers;
      }
    } catch {}

    if (__DEV__) {
      console.log(`[API:REQ] ${config.baseURL ?? client.defaults.baseURL}${config.url}`, {
        method: config.method?.toUpperCase(),
        params: config.params,
        data: config.data,
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (res: AxiosResponse) => {
    if (__DEV__) {
      console.log(`[API:RES] ${res.status} ${res.config.url}`, res.data);
    }
    return res;
  },
  async (error: AxiosError) => {
    if (__DEV__) {
      console.log('[API:ERR]', {
        base: client.defaults.baseURL,
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: (error as any).code,
      });
    }
    return Promise.reject(error);
  }
);

/** =========================================
 * 공통 요청 실행기 (항상 T 반환)
 * ========================================= */
async function requestJSON<T>(cfg: AxiosRequestConfig): Promise<T> {
  try {
    const res = await client.request<T>(cfg);
    return res.data as T;
  } catch (e) {
    const err = e as AxiosError;
    const msg =
      (err.response?.data as any)?.message ??
      (err.response?.data as any)?.error ??
      err.message ??
      '서버 요청에 실패했습니다.';

    Toast.show({
      type: 'error',
      text1: '요청 실패',
      text2: String(msg),
      visibilityTime: 4000,
      position: 'bottom',
    });
    throw err;
  }
}

/** =========================================
 * Public Wrappers
 * ========================================= */
export async function getJSON<T>(url: string, config?: AxiosRequestConfig) {
  return requestJSON<T>({ ...config, method: 'GET', url });
}
export async function postJSON<T>(url: string, body?: any, config?: AxiosRequestConfig) {
  return requestJSON<T>({ ...config, method: 'POST', url, data: body });
}
export async function putJSON<T>(url: string, body?: any, config?: AxiosRequestConfig) {
  return requestJSON<T>({ ...config, method: 'PUT', url, data: body });
}
export async function patchJSON<T>(url: string, body?: any, config?: AxiosRequestConfig) {
  return requestJSON<T>({ ...config, method: 'PATCH', url, data: body });
}
export async function deleteJSON<T>(url: string, config?: AxiosRequestConfig) {
  return requestJSON<T>({ ...config, method: 'DELETE', url });
}

/** =========================================
 * Error Utils
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
 * BaseURL 관리 (레이아웃에서 복구용)
 * ========================================= */
const API_BASE_MODE_KEY = 'api_base_mode_v1';     // 'default' | 'custom'
const API_BASE_CUSTOM_KEY = 'api_base_custom_v1'; // 커스텀 베이스 저장

/** 앱 시작 시 저장된 베이스 URL 복구 */
export async function initApiBaseFromStorage(): Promise<void> {
  try {
    const [mode, customRaw] = await Promise.all([
      SecureStore.getItemAsync(API_BASE_MODE_KEY),
      SecureStore.getItemAsync(API_BASE_CUSTOM_KEY),
    ]);

    let resolved = BASE_URL;

    if (mode === 'custom') {
      const custom = safeNormalize(customRaw || undefined);
      if (custom) resolved = custom;
      else console.warn('[API] invalid custom base in storage, fallback -> default');
    }

    client.defaults.baseURL = resolved;
    axios.defaults.baseURL = resolved; // (선택) 전역 axios에도 반영
    console.log('[API] baseURL set ->', resolved);
  } catch (e) {
    console.warn('[API] initApiBaseFromStorage error:', e);
  }
}

/** 런타임에서 커스텀 베이스 적용/저장 */
export async function setCustomApiBase(rawUrl: string) {
  const normalized = normalizeBase(rawUrl);
  await SecureStore.setItemAsync(API_BASE_MODE_KEY, 'custom');
  await SecureStore.setItemAsync(API_BASE_CUSTOM_KEY, rawUrl);
  client.defaults.baseURL = normalized;
  axios.defaults.baseURL = normalized;
  console.log('[API] custom baseURL set ->', normalized);
}

/** 기본(baseURL from app.json)로 복귀 */
export async function useDefaultApiBase() {
  await SecureStore.setItemAsync(API_BASE_MODE_KEY, 'default');
  await SecureStore.deleteItemAsync(API_BASE_CUSTOM_KEY);
  client.defaults.baseURL = BASE_URL;
  axios.defaults.baseURL = BASE_URL;
  console.log('[API] default baseURL restored ->', BASE_URL);
}

/** 현재 사용중인 baseURL 조회 */
export function getCurrentApiBase(): string {
  return client.defaults.baseURL || BASE_URL;
}

export async function postForm<T>(url: string, formData: FormData, config?: AxiosRequestConfig) {
  // Content-Type 직접 지정하지 않음(axios가 boundary 포함 자동 설정)
  return requestJSON<T>({ ...config, method: 'POST', url, data: formData });
}