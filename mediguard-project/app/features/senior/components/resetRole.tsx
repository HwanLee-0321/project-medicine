// app/features/senior/logout.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { colors } from '@styles/colors';

// ✅ 프로젝트 util들
import { getUserId, verifyCredentials } from '@app/_utils/auth'; // clearUserId, clearAccessToken 제거
import { clearRoleGlobal, clearUserRoleLocal } from '@app/_utils/user';

type Phase = 'input' | 'verifying' | 'confirm' | 'loggingOut';

export default function LogoutScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [phase, setPhase] = useState<Phase>('input');
    const [userId, setUserId] = useState('');   // 저장된 아이디 주입
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

    // ✅ 역할만 초기화해서 /role 로 이동
    const doChangeRole = useCallback(async () => {
        try {
            setPhase('loggingOut'); // 상태명은 유지, UI 텍스트만 변경
            setBusy(true);

            // 1) 디바이스/전역의 역할 정보만 초기화 (로그인/토큰은 그대로 유지)
            await clearUserRoleLocal().catch(() => { }); // role:${userId}
            await clearRoleGlobal().catch(() => { });    // role:global

            Toast.show({ type: 'success', text1: '사용자 유형 초기화 완료', text2: '다시 선택 화면으로 이동합니다.', position: 'bottom' });
            // 2) 역할 선택 화면으로 이동
            router.replace('/role');
        } catch (e) {
            Toast.show({ type: 'error', text1: '사용자 유형 초기화 중 오류', position: 'bottom' });
        } finally {
            setBusy(false);
        }
    }, [router, userId]);

    const askFinalConfirm = useCallback(() => {
        setPhase('confirm');
        Alert.alert(
            '사용자 유형 변경',
            '역할 선택 화면으로 이동합니다. 계속할까요?',
            [
                { text: '아니오', style: 'cancel', onPress: () => setPhase('input') },
                { text: '예', style: 'destructive', onPress: doChangeRole },
            ],
            { cancelable: true }
        );
    }, [doChangeRole]);

    const handleVerify = useCallback(async () => {
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
                    <Text style={styles.headerTitle}>사용자 유형 변경</Text>
                    <View style={styles.iconBtnPlaceholder} />
                </View>
                <View style={styles.content}>
                    {phase === 'loggingOut' ? (
                        <>
                            <ActivityIndicator size="large" />
                            <Text style={styles.text}>역할 초기화 중…</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>사용자 유형 변경</Text>
                            <Text style={styles.desc}>계정 확인을 위해 아이디와 비밀번호를 입력해주세요.</Text>

                            <TextInput
                                style={[styles.input, styles.readonlyInput]}
                                placeholder="아이디"
                                value={userId}
                                editable={false}
                                selectTextOnFocus={false}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="비밀번호"
                                secureTextEntry
                                value={userPw}
                                onChangeText={setUserPw}
                                editable={!busy}
                                autoFocus={true}
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
