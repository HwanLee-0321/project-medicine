// app/index.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, StyleSheet, Platform, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, FormInput, PasswordInput, PrimaryButton, TextLink } from './_components';
import { colors } from '../styles/colors';
import { login, isLoggedIn } from './_utils/auth';
import { getEffectiveRole } from './_utils/user';
import { getErrorMessage } from './_utils/api';
import { hasMealTime } from './_utils/medication';

const ELDERLY_HOME = '/features/senior';
const CAREGIVER_HOME = '/features/caregiver';
const ROLE_SCREEN = '/role';
const SETUP_SCREEN = '/setup';

export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(true);

  const idRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);

  const canSubmit = useMemo(
    () => id.trim().length > 0 && password.trim().length > 0,
    [id, password]
  );

  /** 공통 라우팅: 역할 → 복약시간 순으로 분기 */
  const routeWithRoleAndMealTime = async () => {
    try {
      const role = await getEffectiveRole(); // 사용자별 > 전역 > null
      if (role === 'senior') {
        router.replace(ELDERLY_HOME);
        return;
      }
      if (role === 'caregiver') {
        router.replace(CAREGIVER_HOME);
        return;
      }

      // 역할이 없으면 복약 시간 설정 여부 확인
      const has = await hasMealTime();
      if (has) {
        router.replace(ROLE_SCREEN); // 역할만 선택
      } else {
        router.replace(SETUP_SCREEN); // 먼저 복약 시간 설정
      }
    } catch (e) {
      // 라우팅 단계 에러는 로그인 실패와 구분
      console.warn('[Route] error:', e);
      throw e;
    }
  };

  /** 부팅 시: 이미 로그인되어 있으면 바로 분기 */
  useEffect(() => {
    (async () => {
      try {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
          await routeWithRoleAndMealTime();
          return;
        }
      } catch (e) {
        console.warn('[Boot] route error:', e);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  /** 로그인 처리 (로그인 에러와 라우팅 에러를 분리) */
  const handleLogin = async () => {
    if (!canSubmit || busy) {
      Alert.alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setBusy(true);

    // 1) 로그인만 먼저
    try {
      await login({ id: id.trim(), password });
      console.log('[Login] OK');
    } catch (e) {
      console.warn('[Login] error:', e);
      Alert.alert(getErrorMessage(e, '로그인에 실패했어요.'));
      setBusy(false);
      return; // 로그인 실패면 여기서 종료
    }

    // 2) 라우팅(역할/복약시간) 단계
    try {
      await routeWithRoleAndMealTime();
    } catch (e) {
      console.warn('[Route after login] error:', e);
      Alert.alert(getErrorMessage(e, '로그인 후 이동 중 문제가 발생했어요.'));
    } finally {
      setBusy(false);
    }
  };

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
