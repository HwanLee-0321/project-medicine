import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@styles/colors';
import { setRoleGlobal, setUserRoleLocal } from './_utils/user';  // ✅ 변경
import { isLoggedIn } from './_utils/auth';                       // ✅ 추가

export default function RoleSelect() {
  const router = useRouter();
  const [loading, setLoading] = React.useState<'senior' | 'caregiver' | null>(null);

  const chooseRole = async (isElderly: boolean) => {
    try {
      setLoading(isElderly ? 'senior' : 'caregiver');

      // 1) 디바이스 전역 저장
      await setRoleGlobal(isElderly);

      // 2) 로그인돼 있으면 사용자별 키에도 미러링(멀티계정 대비)
      if (await isLoggedIn()) {
        await setUserRoleLocal(isElderly);
      }

      // 3) 분기 이동
      router.replace(isElderly ? '/features/senior' : '/features/caregiver');
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '역할 저장 중 오류가 발생했어요.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>사용자 유형을 선택해주세요</Text>

      <TouchableOpacity
        style={[styles.roleButton, styles.primaryButton, loading && { opacity: 0.7 }]}
        onPress={() => chooseRole(true)}    // 고령자
        accessibilityLabel="고령자 화면으로 이동"
        disabled={!!loading}
      >
        {loading === 'senior' ? <ActivityIndicator /> : <Text style={styles.primaryButtonText}>고령자</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleButton, styles.secondaryButton, loading && { opacity: 0.7 }]}
        onPress={() => chooseRole(false)}   // 보호자
        accessibilityLabel="보호자 화면으로 이동"
        disabled={!!loading}
      >
        {loading === 'caregiver' ? <ActivityIndicator /> : <Text style={styles.secondaryButtonText}>보호자</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: colors.textPrimary },
  roleButton: { paddingVertical: 18, borderRadius: 12, marginBottom: 16, alignItems: 'center', borderWidth: 1 },
  primaryButton: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondaryButton: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  primaryButtonText: { color: colors.onPrimary, fontSize: 18, fontWeight: '600' },
  secondaryButtonText: { color: colors.onSecondary, fontSize: 18, fontWeight: '600' },
});
