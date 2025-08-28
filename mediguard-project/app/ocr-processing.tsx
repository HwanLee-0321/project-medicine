// app/ocr-processing.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@styles/colors';
import { postForm } from './_utils/api';

/** ========= Types ========= */
type Row = {
  id: string;
  name: string;
  dosage: string;
  timesPerDay: string;
  days: string;
  morning: boolean;
  lunch: boolean;
  dinner: boolean;
};

interface Medication {
  MED_NM?: string;
  med_nm?: string;
  TIMES_PER_DAY?: number;
  times_per_day?: number;
  DURATION_DAYS?: number;
  duration_days?: number;
  DOSAGE?: number;
  dosage?: number;
  [k: string]: any;
}

interface OcrResponse {
  medicines?: Medication[];
  CREATED_AT?: string;
  error?: string;
  raw_text?: string;
}

/** ========= Helpers ========= */
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

/** HEIC → JPEG 변환을 시도하되, 모듈이 없으면 폴백으로 통과 */
async function toUploadable(imageUri: string) {
  const lower = imageUri.toLowerCase();

  // iOS HEIC/HEIF 처리
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) {
    try {
      // 동적 import: 모듈이 설치/링크되지 않아도 앱이 크래시 나지 않도록
      const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
      const out = await manipulateAsync(imageUri, [], {
        compress: 0.9,
        format: SaveFormat.JPEG,
      });
      return { uri: out.uri, name: 'photo.jpg', type: 'image/jpeg' as const };
    } catch {
      // 폴백: 변환 없이 JPEG 태그로 업로드 시도
      return { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' as const };
    }
  }

  // 그 외 확장자 → 안전한 MIME 유니언으로 지정
  const ext = lower.split('.').pop() || 'jpg';
  const type: 'image/jpeg' | 'image/png' | 'image/webp' =
    ext === 'png'  ? 'image/png'
  : ext === 'webp' ? 'image/webp'
                   : 'image/jpeg';

  return { uri: imageUri, name: `photo.${ext}`, type };
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
      // 1) 업로드 파일 준비(HEIC 변환 포함)
      const file = await toUploadable(imageUri);

      // 2) FormData 구성(서버 필드명이 'file'이라고 가정)
      const form = new FormData();
      form.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      // 3) 공용 axios 인스턴스 사용(baseURL + /api 자동 보정)
      const data = await postForm<OcrResponse>('/upload-image/', form);

      // 4) 서버 에러 처리
      if (!data || data.error) {
        throw new Error(data?.error || '서버 오류');
      }

      // 5) 결과 정규화 → medications 화면으로 이동
      const meds = Array.isArray(data.medicines) ? data.medicines : [];
      const rows = meds.map(normalizeMedication).filter(r => r.name.trim().length > 0);

      router.replace({
        pathname: '/medications',
        params: {
          rows: JSON.stringify(rows.length ? rows : makeEmptyRows()),
          error: rows.length ? '' : '이미지에서 약명을 찾지 못했어요. 직접 입력해 주세요.',
        },
      });
    } catch (e: any) {
      const msg =
        (e?.response?.data?.message) ||
        (e?.response?.data?.error) ||
        e?.message ||
        '이미지 인식에 실패했어요. 직접 입력해 주세요.';
      router.replace({
        pathname: '/medications',
        params: {
          rows: JSON.stringify(makeEmptyRows()),
          error: String(msg),
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.statusText}>약 봉투/처방전 인식 중…</Text>
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
