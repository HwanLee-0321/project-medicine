// app/ocr-processing.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@styles/colors';

type Row = { id: string; name: string; timesPerDay: string; days: string };

interface Medication {
  MED_NM: string;
  TIMES_PER_DAY: number;
  DURATION_DAYS: number;
  DOSAGE: number;
}
interface OcrResponse {
  medicines: Medication[];
  CREATED_AT: string;
  error?: string;
  raw_text?: string;
}

const guessMime = (uri: string) => {
  const ext = uri.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
    case 'heif':
      return 'image/heic';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
};

// 사용자가 직접 입력할 수 있도록 기본 4행 빈값 생성
const makeEmptyRows = (n = 4): Row[] =>
  Array.from({ length: n }).map((_, i) => ({
    id: `empty-${i}`,
    name: '',
    timesPerDay: '',
    days: '',
  }));

export default function OCRProcessingScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const previewUri = useMemo(() => (typeof uri === 'string' ? uri : ''), [uri]);

  const [started, setStarted] = useState(false);

  useEffect(() => {
    // 이미지가 없어도 OCR 화면으로 바로 넘겨 사용자 입력 허용
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
      const mime = guessMime(imageUri);
      const ext = mime.split('/')[1] || 'jpg';

      // ✅ RN/Expo에 안전한 파일 객체 방식 (blob 변환 불필요)
      const form = new FormData();
      form.append(
        'file',
        {
          uri: imageUri,
          name: `photo.${ext}`,
          type: mime,
        } as any
      );

      // 서버 URL
      const serverUrl = 'http://221.142.148.73:10005/upload-image/';

      const res = await fetch(serverUrl, {
        method: 'POST',
        body: form,
      });

      const data: OcrResponse = await res.json();

      if (!res.ok || data?.error) {
        throw new Error(data?.error || `서버 오류 (status ${res.status})`);
      }

      // 성공: medicines → rows 매핑
      const meds = Array.isArray(data.medicines) ? data.medicines : [];
      const rows: Row[] = meds
        .map((m, i) => ({
          id: `ocr-${i}`,
          name: (m.MED_NM ?? '').trim(),
          dosage: m.DOSAGE != null ? String(m.DOSAGE) : '',
          timesPerDay: m.TIMES_PER_DAY != null ? String(m.TIMES_PER_DAY) : '',
          days: m.DURATION_DAYS != null ? String(m.DURATION_DAYS) : '',
        }))
        .filter(r => r.name);

      router.replace({
        pathname: '/medications',
        params: {
          rows: JSON.stringify(rows.length ? rows : makeEmptyRows()), // 결과 없으면 빈행으로
        },
      });
    } catch (e: any) {
      // 실패: 곧바로 /ocr로 보내고, 사용자 직접 입력
      router.replace({
        pathname: '/medications',
        params: {
          rows: JSON.stringify(makeEmptyRows()),
          // 필요하면 아래처럼 에러 문자열도 넘겨서 /ocr에서 토스트로 보여줄 수 있음
          // error: e?.message ?? '이미지 인식에 실패했어요.'
        },
      });
    }
  };

  // 이 화면은 잠깐 스피너만 보여줌 (미리보기/다시보기 없음)
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.statusText}>약 봉투/처방전 인식 중…</Text>
      <Text style={styles.subText}>인식 결과가 없으면 직접 입력 화면으로 이동합니다.</Text>
    </View>
  );
}

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
