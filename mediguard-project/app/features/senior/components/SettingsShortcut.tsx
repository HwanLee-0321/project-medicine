// app/features/senior/components/SettingsShortcut.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@styles/colors';

type Props = { onBack: () => void };

export default function SettingsShortcut() {
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* 상단바 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>설정</Text>
          <View style={styles.iconBtnPlaceholder} />
        </View>

        {/* 토글 카드 */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>음성 안내</Text>
            <Switch
              value={voiceGuideEnabled}
              onValueChange={setVoiceGuideEnabled}
              trackColor={{ false: '#D6D6D6', true: colors.primary }}
              thumbColor={Platform.OS === 'android' ? colors.white : undefined}
              ios_backgroundColor="#D6D6D6"
            />
          </View>
          <Text style={styles.helperText}>
            캐릭터가 화면 전환/복약 안내를 음성으로 설명합니다.
          </Text>
        </View>

        {/* 버튼 목록 */}
        <View style={styles.list}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('./resetTime')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>복약 시간 재설정</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('./modifyList')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>복약 목록 수정</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('./resetRole')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>사용자 유형 변경</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logout]}
            onPress={() => router.push('./logout')}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, styles.logoutText]}>로그아웃</Text>
            <Ionicons name="log-out-outline" size={24} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  android: { elevation: 3 },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
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

  card: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginBottom: 20,
    ...cardShadow,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  helperText: {
    fontSize: 15,
    color: colors.textSecondary,
  },

  list: {
    gap: 16,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 22, // ✅ 높이 확장
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EFE7E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...cardShadow,
  },
  actionButtonText: {
    fontSize: 20, // ✅ 글씨 크게
    fontWeight: '700',
    color: colors.textPrimary,
  },

  logout: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.onPrimary,
  },
});
