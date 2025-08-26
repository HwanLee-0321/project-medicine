// app/index.tsx (또는 현재 파일 경로에 맞게)
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Text, StyleSheet, Platform, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, FormInput, PasswordInput, PrimaryButton, TextLink } from './_components';
import { colors } from '../styles/colors';
import { login, isLoggedIn } from './_utils/auth';
import { getEffectiveRole } from './_utils/user';
import { getErrorMessage } from './_utils/api';

const ELDERLY_HOME = '/features/senior';
const CAREGIVER_HOME = '/features/caregiver';
const ROLE_SELECT = '/setup';

export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(true); // 🔹 앱 진입 시 게이트용

  const idRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);

  const canSubmit = useMemo(
    () => id.trim().length > 0 && password.trim().length > 0,
    [id, password]
  );

  // 🔹 공통 분기 함수: 역할에 따라 라우팅
  const routeByRole = useCallback(
    (role: 'senior' | 'caregiver' | null | undefined) => {
      switch (role) {
        case 'senior':
          router.replace(ELDERLY_HOME);
          break;
        case 'caregiver':
          router.replace(CAREGIVER_HOME);
          break;
        default:
          router.replace(ROLE_SELECT);
      }
    },
    [router] // ✅ 의존성
  );

  // 🔹 앱 실행 시: 이미 로그인되어 있다면 즉시 분기
  useEffect(() => {
    (async () => {
      try {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
          const role = await getEffectiveRole(); // 사용자별 > 전역 > null
          routeByRole(role);
          return; // 분기했으면 더 이상 로그인 화면을 보여줄 필요 없음
        }
      } finally {
        setBooting(false); // 로그인 안되어 있으면 로그인 화면 노출
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!canSubmit || busy) {
      Alert.alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    try {
      setBusy(true);
      await login({ id: id.trim(), password });

      // 🔹 로그인 성공 직후에도 같은 분기 로직 적용
      const role = await getEffectiveRole();
      routeByRole(role);
    } catch (e) {
      Alert.alert(getErrorMessage(e, '로그인에 실패했어요.'));
    } finally {
      setBusy(false);
    }
  };

  // 🔹 부팅 게이트 중에는 스피너만
  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

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

        {/* 개발 편의용 빠른 이동 버튼(원하면 제거) */}
        <TouchableOpacity onPress={() => router.push(ELDERLY_HOME)} disabled={busy}>
          <Text>고령자로 이동</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(CAREGIVER_HOME)} disabled={busy}>
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
