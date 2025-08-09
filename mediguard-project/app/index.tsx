import React, { useMemo, useRef } from 'react';
import { Text, StyleSheet, Platform, TextInput, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, FormInput, PasswordInput, PrimaryButton, TextLink } from './components';
import { colors } from '../styles/colors';

export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = React.useState('');
  const [password, setPassword] = React.useState('');

  const idRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);

  // ✅ 추가: 보기/숨김 상태
  const [showPwd, setShowPwd] = React.useState(false);

  const canSubmit = useMemo(
    () => id.trim().length > 0 && password.trim().length > 0,
    [id, password]
  );

  const handleLogin = () => {
    if (!canSubmit) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    router.push('/setup');
  };

  return (
    <ScreenContainer keyboardOffset={Platform.select({ ios: 24, android: 0 }) as number}>
      {/* ✅ 가운데 정렬 래퍼 */}
      <View style={styles.center}>
        <Text style={styles.title}>나만의 도우미</Text>

        <FormInput
          inputRef={idRef}
          placeholder="아이디"
          value={id}
          onChangeText={setId}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => pwRef.current?.focus()}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          accessibilityLabel="아이디 입력"
          testID="input-id"
        />

        {/* ✅ 비밀번호 + 보기/숨김 토글 (최소 수정) */}
        <View style={styles.passwordWrap}>
          <PasswordInput
            inputRef={pwRef}
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            autoComplete="password"
            accessibilityLabel="비밀번호 입력"
            testID="input-password"
            secureTextEntry={!showPwd}          // ← 보기/숨김 제어
            style={styles.pwInputPaddingRight}  // ← 버튼 자리 확보(겹침 방지)
          />
          <TouchableOpacity
            onPress={() => setShowPwd(s => !s)}
            style={styles.toggleBtn}
            accessibilityRole="button"
            accessibilityLabel={showPwd ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            <Text style={styles.toggleText}>{showPwd ? '숨김' : '보기'}</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="로그인"
          onPress={handleLogin}
          disabled={!canSubmit}
          testID="btn-login"
        />

        <TextLink
          title="회원가입"
          onPress={() => router.push('/signup')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // ✅ 화면 정가운데로 모으기
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  // ▼▼▼ 여기부터 토글 위해 아주 살짝 추가 ▼▼▼
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  toggleBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  toggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  pwInputPaddingRight: {
    paddingRight: 60, // 토글 버튼과 겹치지 않게 여유
  },
});