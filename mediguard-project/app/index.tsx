// app/login.tsx (또는 현재 파일 경로에 맞게)
import React, { useMemo, useRef, useState } from 'react';
import { Text, StyleSheet, Platform, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, FormInput, PasswordInput, PrimaryButton, TextLink } from './components';
import { colors } from '../styles/colors';
import { login } from './utils/auth';
import { getErrorMessage } from './utils/api';

export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  const idRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);

  const canSubmit = useMemo(
    () => id.trim().length > 0 && password.trim().length > 0,
    [id, password]
  );

  const handleLogin = async () => {
    if (!canSubmit || busy) {
      Alert.alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    try {
      setBusy(true);
      await login({ id: id.trim(), password });
      // 로그인 성공 시 이동 (필요 경로로 변경 가능)
      router.replace('/setup');
    } catch (e) {
      Alert.alert(getErrorMessage(e, '로그인에 실패했어요.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer keyboardOffset={Platform.select({ ios: 24, android: 0 }) as number}>
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
            secureTextEntry={!showPwd}
            style={styles.pwInputPaddingRight}
          />
          <TouchableOpacity
            onPress={() => setShowPwd((s) => !s)}
            style={styles.toggleBtn}
            accessibilityRole="button"
            accessibilityLabel={showPwd ? '비밀번호 숨기기' : '비밀번호 보기'}
            disabled={busy}
          >
            <Text style={styles.toggleText}>{showPwd ? '숨김' : '보기'}</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title={busy ? '로그인 중...' : '로그인'}
          onPress={handleLogin}
          disabled={!canSubmit || busy}
          testID="btn-login"
          rightIcon={busy ? <ActivityIndicator /> : undefined}
        />

        <TextLink title="회원가입" onPress={() => router.push('/signup')} />

        <TouchableOpacity onPress={() => router.push('/features/senior')} disabled={busy}>
          <Text>고령자로 이동</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/features/caregiver')} disabled={busy}>
          <Text>보호자로 이동</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
    paddingRight: 60,
  },
});
