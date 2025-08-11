import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@styles/colors'; // ✅ 색상 팔레트 적용

export default function RoleSelect() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>사용자 유형을 선택해주세요</Text>

      <TouchableOpacity
        style={[styles.roleButton, styles.primaryButton]}
        onPress={() => router.replace('./features/senior')}
        accessibilityLabel="고령자 화면으로 이동"
      >
        <Text style={styles.primaryButtonText}>고령자</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleButton, styles.secondaryButton]}
        onPress={() => router.replace('./features/caregiver')}
        accessibilityLabel="보호자 화면으로 이동"
      >
        <Text style={styles.secondaryButtonText}>보호자</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.background, // ✅ 배경색 적용
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: colors.textPrimary, // ✅ 텍스트 색상 적용
  },
  roleButton: {
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  primaryButtonText: {
    color: colors.onPrimary, // ✅ 팔레트 onPrimary 사용
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.onSecondary, // ✅ 팔레트 onSecondary 사용
    fontSize: 18,
    fontWeight: '600',
  },
});
