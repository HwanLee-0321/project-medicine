// app/setup.tsx
import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image,
  Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator
} from 'react-native';
import IntroOverlay from './IntroOverlay';
import { useRouter } from 'expo-router';
import { colors } from '@styles/colors';
import { postMealTime } from './_utils/medication'; // ✅ 분리한 도메인 함수 사용

const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const onlyDigits = (s: string) => s.replace(/\D/g, '');
const to2 = (n: number) => n.toString().padStart(2, '0');

type TimePair = { hour: string; minute: string };

// ✅ 컴포넌트 바깥으로 이동(정적 참조 보장)
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  Platform.OS === 'ios' ? (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={48}>
      {children}
    </KeyboardAvoidingView>
  ) : (
    <View style={{ flex: 1 }}>{children}</View>
  );

export default function SetupScreen() {
  const [showOverlay, setShowOverlay] = useState(true);

  const [morning, setMorning] = useState<TimePair>({ hour: '08', minute: '00' });
  const [lunch,   setLunch]   = useState<TimePair>({ hour: '12', minute: '00' });
  const [dinner,  setDinner]  = useState<TimePair>({ hour: '18', minute: '00' });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const compose = (t: TimePair) =>
    `${to2(clampNum(Number(t.hour || '0'), 0, 23))}:${to2(clampNum(Number(t.minute || '0'), 0, 59))}`;

  const handleOverlayEnd = () => setShowOverlay(false);

  const handleFinishSetup = async () => {
    if (!morning.hour || !morning.minute || !lunch.hour || !lunch.minute || !dinner.hour || !dinner.minute) {
      Alert.alert('모든 시간대를 입력해주세요!');
      return;
    }
    const payload = {
      morning: compose(morning),
      lunch:   compose(lunch),
      dinner:  compose(dinner),
    };

    try {
      setIsSubmitting(true);
      const data = await postMealTime(payload); // ✅ 도메인 API 호출
      Alert.alert('설정 완료', data?.message ?? '복약 시간이 저장되었습니다.');
      router.push('/prescription');
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '서버와 통신 중 문제가 발생했어요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showOverlay) {
    return <IntroOverlay onFinish={handleOverlayEnd} userName="000" />;
  }

  return (
    <Wrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>복약 시간 설정</Text>

          <TimeInput emoji="🌅" a11yLabel="아침 복약 시간" value={morning} onChange={setMorning} />
          <TimeInput emoji="☀️" a11yLabel="점심 복약 시간" value={lunch}   onChange={setLunch} />
          <TimeInput emoji="🌙" a11yLabel="저녁 복약 시간" value={dinner}  onChange={setDinner} />

          <TouchableOpacity
            onPress={isSubmitting ? undefined : handleFinishSetup}
            style={[styles.mascotBox, isSubmitting && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="설정을 완료하려면 눌러주세요"
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Image source={require('@assets/images/mascot.png')} style={styles.mascot} />
            {isSubmitting ? (
              <View style={{ marginTop: 10 }}>
                <ActivityIndicator />
                <Text style={[styles.mascotText, { marginTop: 8 }]}>저장 중...</Text>
              </View>
            ) : (
              <Text style={styles.mascotText}>다 됐으면 저를 눌러주세요!</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Wrapper>
  );
}

function TimeInput({
  emoji,
  a11yLabel,
  value,
  onChange,
}: {
  emoji: string;
  a11yLabel: string;
  value: TimePair;
  onChange: (t: TimePair) => void;
}) {
  // 시 입력
  const onHour = (txt: string) => {
    const d = onlyDigits(txt).slice(0, 2);
    if (d.length === 0) return onChange({ ...value, hour: '' });
    if (d.length === 1) {
      const first = Math.min(Number(d), 2); // 0~2
      return onChange({ ...value, hour: String(first) });
    }
    const num = clampNum(Number(d), 0, 23);
    onChange({ ...value, hour: num.toString() });
  };

  // 분 입력
  const onMinute = (txt: string) => {
    const d = onlyDigits(txt).slice(0, 2);
    if (d.length === 0) return onChange({ ...value, minute: '' });
    if (d.length === 1) {
      const first = Math.min(Number(d), 5); // 0~5
      return onChange({ ...value, minute: String(first) });
    }
    const num = clampNum(Number(d), 0, 59);
    onChange({ ...value, minute: num.toString() });
  };

  // 포커스 아웃 시 두 자리 보정
  const onHourBlur = () => {
    if (value.hour === '') return;
    const num = clampNum(Number(value.hour), 0, 23);
    onChange({ ...value, hour: num.toString().padStart(2, '0') });
  };

  const onMinuteBlur = () => {
    if (value.minute === '') return;
    const num = clampNum(Number(value.minute), 0, 59);
    onChange({ ...value, minute: num.toString().padStart(2, '0') });
  };

  return (
    <View style={styles.inputRow} accessibilityLabel={a11yLabel}>
      <Text style={styles.emoji} accessibilityLabel={a11yLabel}>{emoji}</Text>

      <TextInput
        style={[styles.input, styles.hmInput]}
        value={value.hour}
        onChangeText={onHour}
        onBlur={onHourBlur}
        placeholder="HH"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={2}
        textAlign="center"
        blurOnSubmit={false}
        accessibilityLabel={`${a11yLabel} - 시`}
      />
      <Text style={styles.colon}>:</Text>
      <TextInput
        style={[styles.input, styles.hmInput]}
        value={value.minute}
        onChangeText={onMinute}
        onBlur={onMinuteBlur}
        placeholder="MM"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={2}
        textAlign="center"
        blurOnSubmit={false}
        accessibilityLabel={`${a11yLabel} - 분`}
      />
    </View>
  );
}

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
  colon: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginHorizontal: 6,
  },
  button: {
    backgroundColor: '#4E88FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mascotBox: {
    alignItems: 'center',
    marginTop: 28,
  },
  mascot: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  mascotText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
});
