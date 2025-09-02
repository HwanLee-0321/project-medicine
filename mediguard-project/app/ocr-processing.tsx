// app/ocr-processing.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { colors } from '@styles/colors';

/** ========= Types ========= */
type Row = {
  id: string;
  name: string;
  dosage: string;        // 회당 복용량
  timesPerDay: string;   // 일 복용 횟수
  days: string;          // 복약 일수
  morning: boolean;
  lunch: boolean;
  dinner: boolean;
};

interface Medication {
  MED_NM?: string; med_nm?: string;
  TIMES_PER_DAY?: number; times_per_day?: number;
  DURATION_DAYS?: number; duration_days?: number;
  DOSAGE?: number; dosage?: number;
  [k: string]: any;
}
interface OcrResponse {
  medicines?: Medication[];
  CREATED_AT?: string;
  error?: string;
  raw_text?: string;
}

/** ========= Helpers ========= */
const guessMime = (uri: string) => {
  const ext = uri.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'heic':
    case 'heif': return 'image/heic';
    case 'jpg':
    case 'jpeg':
    default: return 'image/jpeg';
  }
};

const makeEmptyRows = (n = 4): Row[] =>
  Array.from({ length: n }).map((_, i) => ({
    id: `empty-${i}`,
    name: '',
    dosage: '',
    timesPerDay: '',
    days: '',
    morning: false,
    lunch: false,
    dinner: false,
  }));

const normalizeMedication = (m: Medication, i: number): Row => {
  const name = (m.MED_NM ?? m.med_nm ?? '').toString().trim();
  const dosageNum = (m.DOSAGE ?? m.dosage ?? null);
  const tpdNum = (m.TIMES_PER_DAY ?? m.times_per_day ?? null);
  const daysNum = (m.DURATION_DAYS ?? m.duration_days ?? null);

  return {
    id: `ocr-${i}`,
    name,
    dosage: dosageNum != null ? String(dosageNum) : '',
    timesPerDay: tpdNum != null ? String(tpdNum) : '',
    days: daysNum != null ? String(daysNum) : '',
    morning: false,
    lunch: false,
    dinner: false,
  };
};

/** ========= Logging utils ========= */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** ========= LAN OCR 서버 주소 =========
 * 우선순위:
 * 1) app.json의 expo.extra.ocrBaseURL
 * 2) app.json의 expo.extra.baseURL의 host를 재사용, 포트 8000 강제
 */
function getOcrBaseURL(): string {
  const extra: any =
    (Constants.expoConfig?.extra as any) ??
    ((Constants as any).manifest?.extra as any) ??
    {};

  const rawOcr = (extra?.ocrBaseURL ?? '').toString().trim();
  if (rawOcr) return rawOcr.replace(/\/+$/, '');

  const rawApi = (extra?.baseURL ?? '').toString().trim();
  if (!rawApi) throw new Error('baseURL가 설정되어 있지 않습니다. app.json을 확인하세요.');

  // baseURL에서 host를 추출하고 포트 8000으로 바꾼다 (예: http://192.168.111.218:3000 -> http://192.168.111.218:8000)
  try {
    const u = new URL(rawApi);
    u.port = '8000';
    u.pathname = '/';
    return u.toString().replace(/\/+$/, '');
  } catch {
    // 파싱 실패 시, 사용자가 직접 extra.ocrBaseURL을 넣도록 유도
    throw new Error('ocrBaseURL를 직접 설정해주세요 (예: "http://192.168.111.218:8000")');
  }
}

/** 요청 1회 실행: reqId + 타임아웃 + 안전 파싱 + 상세 로그 */
async function postOnceWithLogs(url: string, form: FormData, timeoutMs = 20000) {
  const reqId = uuid();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  form.append('req_id', reqId); // 서버에서 추적하기 쉽게 폼에도 포함

  console.log(`[OCR][REQ ${reqId}] POST ${url}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: form,
      signal: ctrl.signal,
      headers: { 'X-Req-Id': reqId }, // 서버 미들웨어에서 확인 가능
    });

    const ctype = res.headers.get('content-type') || '';
    const bodyText = await res.text();

    console.log(`[OCR][RES ${reqId}] status=${res.status} len=${bodyText.length}`);

    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${bodyText.slice(0, 200)}`);

    if (!ctype.includes('application/json')) {
      throw new Error(`Non-JSON response: ${bodyText.slice(0, 200)}`);
    }
    const data = JSON.parse(bodyText);
    return { data: data as OcrResponse, reqId };
  } catch (e: any) {
    clearTimeout(timer);
    console.log(`[OCR][ERR ${reqId}] ${e?.message || e}`);
    throw e;
  }
}

/** ========= Component ========= */
export default function OCRProcessingScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const previewUri = useMemo(() => (typeof uri === 'string' ? uri : ''), [uri]);

  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!previewUri) {
      router.replace({
        pathname: '/medications',
        params: { rows: JSON.stringify(makeEmptyRows()) },
      });
      return;
    }
    if (!started) {
      setStarted(true);
      runOCR(previewUri);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUri, started]);

  const runOCR = async (imageUri: string) => {
    try {
      // 기본 로그: 현재 OCR base 확인
      console.log('[OCR] base =', getOcrBaseURL());

      const mime = guessMime(imageUri);
      const ext = mime.split('/')[1] || 'jpg';

      const form = new FormData();
      form.append('file', { uri: imageUri, name: `photo.${ext}`, type: mime } as any);

      const base = getOcrBaseURL();
      // 슬래시 유무 모두 시도 (프록시/서버 환경에 따라 301/404 피하기 위함)
      const url1 = `${base}/upload-image`;
      const url2 = `${base}/upload-image/`;

      const { data } = await postOnceWithLogs(url1, form).catch(async () => {
        console.log('[OCR][RETRY] switching to trailing slash');
        return postOnceWithLogs(url2, form);
      });

      if (data?.error) throw new Error(data.error);

      const meds = Array.isArray(data?.medicines) ? data.medicines : [];
      const rows = meds.map(normalizeMedication).filter(r => r.name.trim().length > 0);

      router.replace({
        pathname: '/medications',
        params: {
          rows: JSON.stringify(rows.length ? rows : makeEmptyRows()),
          error: rows.length ? '' : '이미지에서 약명을 찾지 못했어요. 직접 입력해 주세요.',
        },
      });
    } catch (e: any) {
      router.replace({
        pathname: '/medications',
        params: {
          rows: JSON.stringify(makeEmptyRows()),
          error: e?.message ?? '이미지 인식에 실패했어요. 직접 입력해 주세요.',
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.statusText}>처방전 인식 중…</Text>
      <Text style={styles.subText}>인식 결과가 없으면 직접 입력 화면으로 이동합니다.</Text>
    </View>
  );
}

/** ========= Styles ========= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
