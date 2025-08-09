// app/signup.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../styles/colors'; // 경로 확인!

export default function SignUpScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [calendarType, setCalendarType] = useState<'양력' | '음력'>('양력');
  const [gender, setGender] = useState<'남성' | '여성' | null>(null);

  // 포커스 시 테두리 강조를 위해 어떤 인풋이 포커스인지 추적
  const [focus, setFocus] = useState<
    'name' | 'id' | 'password' | 'guardianEmail' | 'birthdate' | null
  >(null);

  const handleCheckDuplicateId = () => {
    if (!id) {
      Alert.alert('아이디를 입력해주세요.');
      setIsIdChecked(false);
      return;
    }
    if (id === 'takenId') {
      Alert.alert('이미 사용 중인 아이디입니다.');
      setIsIdChecked(false);
    } else {
      Alert.alert('사용 가능한 아이디입니다!');
      setIsIdChecked(true);
    }
  };

  const handleSignUp = () => {
    if (!name || !id || !password || !guardianEmail || !birthdate || !gender) {
      Alert.alert('모든 항목을 입력해주세요.');
      return;
    }
    if (!isIdChecked) {
      Alert.alert('아이디 중복 확인을 해주세요!');
      return;
    }

    Alert.alert(`${name}님, 회원가입이 완료되었습니다!`);
    // const newUser = { ... } 실제 저장 로직은 추후 연동
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 48, android: 0 })}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>

            <TextInput
              style={[styles.input, focus === 'name' && styles.inputFocused]}
              placeholder="이름"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocus('name')}
              onBlur={() => setFocus(null)}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }, focus === 'id' && styles.inputFocused]}
                placeholder="아이디"
                placeholderTextColor={colors.textSecondary}
                value={id}
                onChangeText={(text) => { setId(text); setIsIdChecked(false); }}
                returnKeyType="done"
                onFocus={() => setFocus('id')}
                onBlur={() => setFocus(null)}
              />
              <TouchableOpacity style={styles.checkButton} onPress={handleCheckDuplicateId} activeOpacity={0.85}>
                <Text style={styles.checkText}>중복 확인</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, focus === 'password' && styles.inputFocused]}
              placeholder="비밀번호"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocus('password')}
              onBlur={() => setFocus(null)}
            />

            <TextInput
              style={[styles.input, focus === 'guardianEmail' && styles.inputFocused]}
              placeholder="보호자 이메일"
              placeholderTextColor={colors.textSecondary}
              value={guardianEmail}
              onChangeText={setGuardianEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocus('guardianEmail')}
              onBlur={() => setFocus(null)}
            />

            <TextInput
              style={[styles.input, focus === 'birthdate' && styles.inputFocused]}
              placeholder="생년월일 (YYYY-MM-DD)"
              placeholderTextColor={colors.textSecondary}
              value={birthdate}
              onChangeText={setBirthdate}
              keyboardType="number-pad"
              maxLength={10}
              onFocus={() => setFocus('birthdate')}
              onBlur={() => setFocus(null)}
            />

            <Text style={styles.label}>달력 종류</Text>
            <View style={styles.row}>
              {['양력', '음력'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.radioItem}
                  onPress={() => setCalendarType(type as '양력' | '음력')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioCircle, calendarType === type && styles.radioSelected]} />
                  <Text style={styles.radioLabel}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>성별</Text>
            <View style={styles.row}>
              {['남성', '여성'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.radioItem}
                  onPress={() => setGender(g as '남성' | '여성')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioCircle, gender === g && styles.radioSelected]} />
                  <Text style={styles.radioLabel}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignUp} activeOpacity={0.9}>
              <Text style={styles.buttonText}>회원가입 완료</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.link}>로그인 화면으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },

  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.background,     // 크림톤 배경
    paddingBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 30,
    textAlign: 'center',
    color: colors.textPrimary,              // 진한 브라운
  },

  label: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '700',
    color: colors.textPrimary,
    fontSize: 15,
  },

  input: {
    borderWidth: 2,                         // 두께↑
    borderColor: colors.textPrimary,        // 진한 테두리
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 16,
  },

  inputFocused: {
    borderColor: colors.primary,            // 포커스 시 주색으로 강조
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  checkButton: {
    marginLeft: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.secondary,      // 보조색
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.textPrimary,        // 경계 또렷
  },

  checkText: {
    fontWeight: '800',
    color: colors.textPrimary,
    fontSize: 14,
  },

  button: {
    backgroundColor: colors.primary,        // 주색 버튼
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: colors.textPrimary,              // 흰색 대신 진한 브라운 → 대비↑
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.2,
  },

  link: {
    marginTop: 20,
    color: colors.primary,                  // 링크는 주색으로 또렷하게
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },

  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    marginRight: 8,
    backgroundColor: 'transparent',
  },

  radioSelected: {
    backgroundColor: colors.primary,        // 선택 시 내부 채움
    borderColor: colors.textPrimary,
  },

  radioLabel: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});
