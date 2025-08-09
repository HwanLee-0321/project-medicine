import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image,
  Platform, KeyboardAvoidingView, ScrollView
} from 'react-native';
import IntroOverlay from './IntroOverlay';
import { useRouter } from 'expo-router';
import { colors } from '@styles/colors';

const clampNum = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const onlyDigits = (s: string) => s.replace(/\D/g, '');
const to2 = (n: number) => n.toString().padStart(2, '0');

type TimePair = { hour: string; minute: string };

export default function SetupScreen() {
  const [showOverlay, setShowOverlay] = useState(true);

  const [morning, setMorning] = useState<TimePair>({ hour: '08', minute: '00' });
  const [lunch,   setLunch]   = useState<TimePair>({ hour: '12', minute: '00' });
  const [dinner,  setDinner]  = useState<TimePair>({ hour: '18', minute: '00' });

  const router = useRouter();

  const compose = (t: TimePair) =>
    `${to2(clampNum(Number(t.hour || '0'), 0, 23))}:${to2(clampNum(Number(t.minute || '0'), 0, 59))}`;

  const handleOverlayEnd = () => setShowOverlay(false);

  const handleFinishSetup = () => {
    if (!morning.hour || !morning.minute || !lunch.hour || !lunch.minute || !dinner.hour || !dinner.minute) {
      Alert.alert('모든 시간대를 입력해주세요!');
      return;
    }
    const result = {
      morning: compose(morning),
      lunch:   compose(lunch),
      dinner:  compose(dinner),
    };
    console.log('설정된 시간:', result);
    Alert.alert('설정이 완료되었습니다!');
    router.push('/prescription');
  };

  if (showOverlay) {
    return <IntroOverlay onFinish={handleOverlayEnd} userName="000" />;
  }

  // iOS는 키보드 회피, Android는 기본 View
  const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) =>
    Platform.OS === 'ios' ? (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={48}>
        {children}
      </KeyboardAvoidingView>
    ) : (
      <View style={{ flex: 1 }}>{children}</View>
    );

  return (
    <Wrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>복약 시간 설정</Text>

          <TimeInput emoji="🌅" a11yLabel="아침 복약 시간" value={morning} onChange={setMorning} />
          <TimeInput emoji="☀️" a11yLabel="점심 복약 시간" value={lunch}   onChange={setLunch} />
          <TimeInput emoji="🌙" a11yLabel="저녁 복약 시간" value={dinner}  onChange={setDinner} />

          <TouchableOpacity
            onPress={handleFinishSetup}
            style={styles.mascotBox}
            accessibilityRole="button"
            accessibilityLabel="설정을 완료하려면 눌러주세요"
          >
            <Image source={require('@assets/images/mascot.png')} style={styles.mascot} />
            <Text style={styles.mascotText}>다 됐으면 저를 눌러주세요!</Text>
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
  const onHour = (txt: string) => {
    const d = onlyDigits(txt).slice(0, 2);
    const n = d === '' ? '' : to2(clampNum(Number(d), 0, 23));
    onChange({ ...value, hour: n.slice(-2) });
  };
  const onMinute = (txt: string) => {
    const d = onlyDigits(txt).slice(0, 2);
    const n = d === '' ? '' : to2(clampNum(Number(d), 0, 59));
    onChange({ ...value, minute: n.slice(-2) });
  };

  return (
    <View style={styles.inputRow} accessibilityLabel={a11yLabel}>
      <Text style={styles.emoji} accessibilityLabel={a11yLabel}>{emoji}</Text>

      <TextInput
        style={[styles.input, styles.hmInput]}
        value={value.hour}
        onChangeText={onHour}
        placeholder="HH"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        maxLength={2}
        inputMode="numeric"
        textAlign="center"
        accessibilityLabel={`${a11yLabel} - 시`}
      />
      <Text style={styles.colon}>:</Text>
      <TextInput
        style={[styles.input, styles.hmInput]}
        value={value.minute}
        onChangeText={onMinute}
        placeholder="MM"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        maxLength={2}
        inputMode="numeric"
        textAlign="center"
        accessibilityLabel={`${a11yLabel} - 분`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,                     // ✅ 화면 높이 채움
    justifyContent: 'center',    // ✅ 세로 중앙 정렬
    alignItems: 'center',        // 가로 중앙
    backgroundColor: colors.background,
    paddingBottom: 120,          // 마스코트/키보드 여유
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
