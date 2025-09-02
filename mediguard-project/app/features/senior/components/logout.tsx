// app/features/senior/logout.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { colors } from '@styles/colors';

// ✅ 프로젝트 util들
import { clearAccessToken } from '@app/_utils/api';
import { getUserId, clearUserId, verifyCredentials } from '@app/_utils/auth'; // ⬅️ getUserId 추가
import { clearRoleGlobal, clearUserRoleLocal } from '@app/_utils/user';

type Phase = 'input' | 'verifying' | 'confirm' | 'loggingOut';

export default function LogoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('input');
  const [userId, setUserId] = useState('');   // ⬅️ 저장된 아이디를 여기에 주입
  const [userPw, setUserPw] = useState('');
  const [busy, setBusy] = useState(false);

  // ⬇️ 마운트 시 현재 로그인된 user_id 읽어와 잠그기
  useEffect(() => {
    (async () => {
      const saved = await getUserId();
      if (!saved) {
        Toast.show({ type: 'error', text1: '로그인 정보가 없습니다.', position: 'bottom' });
        router.back();
        return;
      }
      setUserId(saved);
    })();
  }, [router]);

  const doRealLogout = useCallback(async () => {
    try {
      setPhase('loggingOut');
      setBusy(true);

      // 1) 토큰/역할/유저ID 정리 (userId 기반 키는 먼저 지우는 편이 안전)
      await clearUserRoleLocal().catch(() => { }); // role:${userId}
      await clearAccessToken().catch(() => { });
      await clearUserId().catch(() => { });
      await clearRoleGlobal().catch(() => { });    // role:global

      // 2) axios Authorization 헤더 제거
      delete (axios.defaults.headers.common as any)?.Authorization;

      // 3) 임시 세션/플래그 정리(선택)
      await SecureStore.deleteItemAsync('refreshToken').catch(() => { });
      await SecureStore.deleteItemAsync('user').catch(() => { });

      Toast.show({ type: 'success', text1: '로그아웃 되었습니다', position: 'bottom' });
      router.replace('/'); // 필요 시 다른 경로로
    } catch (e) {
      Toast.show({ type: 'error', text1: '로그아웃 중 오류가 발생했습니다', position: 'bottom' });
    } finally {
      setBusy(false);
    }
  }, [router]);

  const askFinalConfirm = useCallback(() => {
    setPhase('confirm');
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '아니오', style: 'cancel', onPress: () => setPhase('input') },
        { text: '예', style: 'destructive', onPress: doRealLogout },
      ],
      { cancelable: true }
    );
  }, [doRealLogout]);

  const handleVerify = useCallback(async () => {
    // 간단 유효성
    if (!userId.trim() || !userPw) {
      Toast.show({ type: 'info', text1: '아이디와 비밀번호를 입력하세요', position: 'bottom' });
      return;
    }

    try {
      setBusy(true);
      setPhase('verifying');
      const ok = await verifyCredentials(userId.trim(), userPw);
      if (ok) {
        Toast.show({ type: 'success', text1: '확인 완료', position: 'bottom' });
        askFinalConfirm();
      } else {
        Toast.show({ type: 'error', text1: '아이디 또는 비밀번호가 올바르지 않습니다', position: 'bottom' });
        setPhase('input');
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: '오류가 발생했습니다', position: 'bottom' });
      setPhase('input');
    } finally {
      setBusy(false);
    }
  }, [userId, userPw, askFinalConfirm]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* 상단바 */}
        <View style={[
          styles.header,
          { top: insets.top } // iOS/안전영역 보정
        ]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>로그아웃</Text>
          <View style={styles.iconBtnPlaceholder} />
        </View>
        <View style={styles.content}>
          {phase === 'loggingOut' ? (
            <>
              <ActivityIndicator size="large" />
              <Text style={styles.text}>로그아웃 중…</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>로그아웃 확인</Text>
              <Text style={styles.desc}>계정 확인을 위해 아이디와 비밀번호를 입력해주세요.</Text>

              <TextInput
                style={[styles.input, styles.readonlyInput]}   // ⬅️ 비편집 스타일 추가
                placeholder="아이디"
                value={userId}
                editable={false}                // ⬅️ 수정 불가
                selectTextOnFocus={false}       // ⬅️ 포커스 시 선택도 방지
              // onChangeText 제거 (잠금)
              />
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                secureTextEntry
                value={userPw}
                onChangeText={setUserPw}
                editable={!busy}
                autoFocus={true}               // ⬅️ 비밀번호 칸에 바로 포커스
                returnKeyType="done"
                onSubmitEditing={handleVerify}
              />

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.button, styles.outline]}
                  onPress={() => router.back()}
                  disabled={busy}
                >
                  <Text style={[styles.buttonText, styles.outlineText]}>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, busy ? styles.buttonDisabled : styles.primary]}
                  onPress={handleVerify}
                  disabled={busy}
                >
                  {phase === 'verifying' ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.buttonText}>확인</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background ?? '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background ?? '#FFF',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPlaceholder: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  content: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary ?? '#333',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: colors.textSecondary ?? '#666',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.panel ?? '#eee',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary ?? '#333',
    marginBottom: 12,
  },
  /** 읽기 전용 시 살짝 구분감 */
  readonlyInput: {
    backgroundColor: '#F7F7F7',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textSecondary ?? '#8D6E63',
  },
  outlineText: {
    color: colors.textSecondary ?? '#8D6E63',
  },
  buttonText: {
    color: colors.onPrimary ?? '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary ?? '#333',
    textAlign: 'center',
  },
});
