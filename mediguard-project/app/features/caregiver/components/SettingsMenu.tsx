// app/features/caregiver/SettingsMenu.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@styles/colors';

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  android: { elevation: 3 },
});

export default function SettingsMenu() {
  const router = useRouter();
  const go = (href: string) => router.push(href);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* ← 뒤로가기 (왼쪽 상단, 아래로 배치) */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* 중앙보다 살짝 위 컨텐츠 */}
        <ScrollView
          contentContainerStyle={styles.centerContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>설정</Text>

          <View style={styles.list}>
            {/* 복약 시간 재설정 */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => go('/features/caregiver/components/MedicationTime')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>복약 시간 재설정</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* 알림 설정 */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => go('/features/caregiver/components/NotificationSetting')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>알림 설정</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* 사용자 유형 변경 */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => go('/features/caregiver/components/roleSelect')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>사용자 유형 변경</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* ✅ 복약 데이터 관리 → 예전 달력 화면으로 이동 */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => go('/Calendar')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>복약 데이터 관리</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },

  // 중앙보다 살짝 위로: translateY로 -28px 올림
  centerContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -28 }],
  },

  // 뒤로가기 버튼 (왼쪽 상단에서 아래로)
  backButton: {
    position: 'absolute',
    top: 80,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 20,
  },

  list: { gap: 16, width: '100%', maxWidth: 560 },

  actionButton: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EFE7E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...cardShadow,
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
