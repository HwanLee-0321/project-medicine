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
  if (!raw) return undefined;
  const trimmed = raw.trim().replace(/\/+$/, '');
  return /\/api$/.test(trimmed) ? trimmed : `${trimmed}/api`;
};

/** =========================================
 * app.json(extra)에서 주소 읽기
 * ========================================= */
const extra: any =
  (Constants.expoConfig?.extra as any) ??
  ((Constants as any).manifest?.extra as any) ??
  {};

// ⚠️ 필수: baseURL 없으면 앱 시작 시 즉시 실패 (설정 실수 조기 발견)
let BASE_URL = normalizeBase(extra?.baseURL as string | undefined);
if (!BASE_URL) {
  throw new Error('[API] extra.baseURL is missing in app.json (expo.extra.baseURL)');
}

/** =========================================
 * Axios instance (단일 서버)
 * ========================================= */
const makeClient = (baseURL: string) =>
  axios.create({
    baseURL,
    timeout: 12000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

let client = makeClient(BASE_URL);

/** =========================================
 * Active base URL 조회
 * ========================================= */
export const getActiveBaseURL = () => client.defaults.baseURL ?? '';

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
const attachInterceptors = (c: ReturnType<typeof makeClient>) => {
  c.interceptors.request.use(
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
        console.log(`[API:REQ] ${c.defaults.baseURL}${config.url}`, {
          method: config.method?.toUpperCase(),
          params: config.params,
          data: config.data,
        });
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  c.interceptors.response.use(
    (res: AxiosResponse) => {
      if (__DEV__) {
        console.log(`[API:RES] ${res.status} ${res.config.url}`, res.data);
      }
      return res;
    },
    async (error: AxiosError) => {
      if (__DEV__) {
        console.log('[API:ERR]', {
          base: c.defaults.baseURL,
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
};

// 인터셉터 장착
attachInterceptors(client);

/** =========================================
 * 공통 요청 실행기 (단일 서버)
 * ========================================= */
async function requestJSON<T>(cfg: AxiosRequestConfig): Promise<T> {
  try {
    const res = await client.request<T>(cfg);
    return res.data;
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
      text2: msg,
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
