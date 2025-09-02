/* 복약 시간 재설정 */
// app\features\senior\components\resetTime.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@styles/colors';
import { fetchMealTime } from '@app/_utils/medication';
import { getUserId } from '@app/_utils/auth';
import { postJSON } from '@app/_utils/api';

/** ================================
 * Types
 * ================================ */

// 서버가 내려주는 복약 시간 조회 응답 (예상 스키마)
export type MealTimeReadResponse = {
  morning: string | null; // "HH:mm" | null
  lunch: string | null;   // "HH:mm" | null
  dinner: string | null;  // "HH:mm" | null
  // 그 외 메타 필드가 있어도 무시
};

type TimePair = { hour: string; minute: string };

/** ================================
 * Utils
 * ================================ */
const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const onlyDigits = (s: string) => s.replace(/\D/g, '');
const to2 = (n: number) => n.toString().padStart(2, '0');

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  Platform.OS === 'ios' ? (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={48}>
      {children}
    </KeyboardAvoidingView>
  ) : (
    <View style={{ flex: 1 }}>{children}</View>
  );

/** ================================
 * Screen
 * ================================ */
export default function MealTimeResetScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 각 시간대 상태 (null = 미설정)
  const [morning, setMorning] = useState<TimePair | null>(null);
  const [lunch, setLunch] = useState<TimePair | null>(null);
  const [dinner, setDinner] = useState<TimePair | null>(null);

  // 초기 로드: 서버에서 현재 값 읽어오기
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const t = await fetchMealTime();
        if (!alive) return;
        setMorning(fromHHMM(t.morning));
        setLunch(fromHHMM(t.lunch));
        setDinner(fromHHMM(t.dinner));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? '복약 시간 정보를 불러오지 못했어요.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onSave = useCallback(async () => {
    try {
      setSaving(true);
      const user_id = await getUserId();
      if (!user_id) throw new Error('로그인이 필요합니다.');

      // 부분 설정 허용: null 은 미설정으로 서버에 전달
      const payload = {
        user_id,
        morning: composeOrNull(morning),
        lunch: composeOrNull(lunch),
        dinner: composeOrNull(dinner),
      } as const;

      // postMealTime 은 string 타입만 허용할 수 있어 직접 호출
      const res = await postJSON<{ message?: string }>('/medication/time', payload);
      Alert.alert('저장 완료', res?.message ?? '복약 시간이 저장되었습니다.');
      router.back(); // 이전 화면으로 복귀
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '저장 중 문제가 발생했어요.');
    } finally {
      setSaving(false);
    }
  }, [morning, lunch, dinner, router]);

  const canSave = useMemo(() => {
    // 모든 null 도 허용하지만, 최소 1개는 입력하라는 정책이 필요하면 아래 라인 사용
    // return Boolean(morning || lunch || dinner);
    return true;
  }, [morning, lunch, dinner]);

  if (loading) {
    return (
      <Wrapper>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={[styles.ctaBtn, { marginTop: 16 }]} onPress={() => router.back()}>
            <Text style={styles.ctaText}>뒤로가기</Text>
          </TouchableOpacity>
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>복약 시간 재설정</Text>

          <TimeInput
            labelEmoji="🌅"
            a11yLabel="아침 복약 시간"
            value={morning}
            onChange={setMorning}
          />

          <TimeInput
            labelEmoji="☀️"
            a11yLabel="점심 복약 시간"
            value={lunch}
            onChange={setLunch}
          />

          <TimeInput
            labelEmoji="🌙"
            a11yLabel="저녁 복약 시간"
            value={dinner}
            onChange={setDinner}
          />

          <TouchableOpacity
            onPress={saving || !canSave ? undefined : onSave}
            style={[styles.saveBtn, (!canSave || saving) && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="저장하기"
            disabled={saving || !canSave}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.saveText}>저장하기</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.ctaBtn, { backgroundColor: colors.panel, marginTop: 12 }]}
            accessibilityRole="button"
            accessibilityLabel="취소하고 돌아가기"
          >
            <Text style={[styles.ctaText, { color: colors.textPrimary }]}>취소</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Wrapper>
  );
}

/** ================================
 * Components
 * ================================ */
function TimeInput({
  labelEmoji,
  a11yLabel,
  value,
  onChange,
}: {
  labelEmoji: string;
  a11yLabel: string;
  value: TimePair | null; // null = 미설정
  onChange: (t: TimePair | null) => void;
}) {
  const isUnset = value === null;

  const onHour = (txt: string) => {
    if (isUnset) return; // 미설정이면 입력 막음
    const d = onlyDigits(txt).slice(0, 2);
    if (d.length === 0) return onChange({ ...value!, hour: '' });
    if (d.length === 1) {
      const first = Math.min(Number(d), 2); // 0~2
      return onChange({ ...value!, hour: String(first) });
    }
    const num = clampNum(Number(d), 0, 23);
    onChange({ ...value!, hour: num.toString() });
  };

  const onMinute = (txt: string) => {
    if (isUnset) return;
    const d = onlyDigits(txt).slice(0, 2);
    if (d.length === 0) return onChange({ ...value!, minute: '' });
    if (d.length === 1) {
      const first = Math.min(Number(d), 5); // 0~5
      return onChange({ ...value!, minute: String(first) });
    }
    const num = clampNum(Number(d), 0, 59);
    onChange({ ...value!, minute: num.toString() });
  };

  const onHourBlur = () => {
    if (isUnset) return;
    if (value!.hour === '') return;
    const num = clampNum(Number(value!.hour), 0, 23);
    onChange({ ...value!, hour: to2(num) });
  };

  const onMinuteBlur = () => {
    if (isUnset) return;
    if (value!.minute === '') return;
    const num = clampNum(Number(value!.minute), 0, 59);
    onChange({ ...value!, minute: to2(num) });
  };

  const toggleUnset = () => {
    if (isUnset) {
      // 미설정 -> 기본값 세팅 후 활성화
      onChange({ hour: '08', minute: '00' });
    } else {
      // 활성화 -> 미설정(null)
      onChange(null);
    }
  };

  return (
    <View style={styles.inputRow} accessibilityLabel={a11yLabel}>
      <Text style={styles.emoji} accessibilityLabel={a11yLabel}>{labelEmoji}</Text>

      <View style={styles.hmGroup}>
        <TextInput
          style={[styles.input, styles.hmInput, isUnset && styles.disabledInput]}
          value={isUnset ? '' : value!.hour}
          onChangeText={onHour}
          onBlur={onHourBlur}
          placeholder="HH"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={2}
          textAlign="center"
          editable={!isUnset}
          accessibilityLabel={`${a11yLabel} - 시`}
        />
        <Text style={styles.colon}>:</Text>
        <TextInput
          style={[styles.input, styles.hmInput, isUnset && styles.disabledInput]}
          value={isUnset ? '' : value!.minute}
          onChangeText={onMinute}
          onBlur={onMinuteBlur}
          placeholder="MM"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={2}
          textAlign="center"
          editable={!isUnset}
          accessibilityLabel={`${a11yLabel} - 분`}
        />
      </View>

      <TouchableOpacity
        onPress={toggleUnset}
        style={[styles.unsetBtn, isUnset ? styles.unsetBtnOn : styles.unsetBtnOff]}
        accessibilityRole="button"
        accessibilityLabel={isUnset ? '미설정 해제' : '미설정으로 변경'}
        activeOpacity={0.8}
      >
        <Text style={[styles.unsetText, isUnset && { color: colors.white }]}>미설정</Text>
      </TouchableOpacity>
    </View>
  );
}

/** ================================
 * Helpers
 * ================================ */
function fromHHMM(v: string | null): TimePair | null {
  if (!v) return null;
  const [h, m] = v.split(':');
  const hh = to2(clampNum(Number(h || '0'), 0, 23));
  const mm = to2(clampNum(Number(m || '0'), 0, 59));
  return { hour: hh, minute: mm };
}

function composeOrNull(t: TimePair | null): string | null {
  if (!t) return null;
  const hh = to2(clampNum(Number(t.hour || '0'), 0, 23));
  const mm = to2(clampNum(Number(t.minute || '0'), 0, 59));
  return `${hh}:${mm}`;
}

/** ================================
 * Styles
 * ================================ */
const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingBottom: 120,
  },
  inner: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 22,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  inputRow: {
    alignSelf: 'center',
    width: 320,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    marginBottom: 14,
  },
  emoji: {
    width: 40,
    textAlign: 'center',
    fontSize: 24,
    marginRight: 6,
  },
  hmGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.panel,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  hmInput: {
    width: 88,
    textAlign: 'center',
  },
  disabledInput: {
    backgroundColor: '#EEE',
    color: '#999',
  },
  colon: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginHorizontal: 6,
  },
  unsetBtn: {
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.panel,
  },
  unsetBtnOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unsetBtnOff: {
    backgroundColor: colors.white,
  },
  unsetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaBtn: {
    backgroundColor: '#4E88FF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
