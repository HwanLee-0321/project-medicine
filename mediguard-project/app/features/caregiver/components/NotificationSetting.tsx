// components/NotificationSettingTab.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

// 화면을 살짝 아래로 내리는 상단 여백
const HEADER_SPACER = Platform.select({
  ios: 16,
  android: (StatusBar.currentHeight ?? 0) + 8,
}) as number;

const STORAGE_KEYS = {
  notif: 'notif_enabled',
  emergency: 'notif_emergency',
  sound: 'notif_sound',
  threshold: 'notif_miss_threshold',
  missedCount: 'notif_miss_current',
};

export default function NotificationSettingTab() {
  const router = useRouter();

  // 토글들
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 미복약 임계값 & 누적
  const [missThreshold, setMissThreshold] = useState(3);
  const [missedCount, setMissedCount] = useState(0);

  // 저장된 설정 로드
  useEffect(() => {
    (async () => {
      try {
        const [sNotif, sEmer, sSound, sThreshold, sMissed] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.notif),
          AsyncStorage.getItem(STORAGE_KEYS.emergency),
          AsyncStorage.getItem(STORAGE_KEYS.sound),
          AsyncStorage.getItem(STORAGE_KEYS.threshold),
          AsyncStorage.getItem(STORAGE_KEYS.missedCount),
        ]);

        if (sNotif !== null) setNotificationEnabled(sNotif === '1');
        if (sEmer !== null) setEmergencyAlert(sEmer === '1');
        if (sSound !== null) setSoundEnabled(sSound === '1');
        if (sThreshold !== null) setMissThreshold(Math.max(1, Number(sThreshold) || 3));
        if (sMissed !== null) setMissedCount(Math.max(0, Number(sMissed) || 0));
      } catch (e) {
        console.warn('알림 설정 로드 실패:', e);
      }
    })();
  }, []);

  const saveSettings = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.notif, notificationEnabled ? '1' : '0'),
        AsyncStorage.setItem(STORAGE_KEYS.emergency, emergencyAlert ? '1' : '0'),
        AsyncStorage.setItem(STORAGE_KEYS.sound, soundEnabled ? '1' : '0'),
        AsyncStorage.setItem(STORAGE_KEYS.threshold, String(missThreshold)),
        AsyncStorage.setItem(STORAGE_KEYS.missedCount, String(missedCount)),
      ]);
      Alert.alert('저장 완료', '알림 설정이 저장되었어요.');
    } catch (e) {
      console.warn('알림 설정 저장 실패:', e);
      Alert.alert('저장 실패', '설정을 저장할 수 없어요.');
    }
  };

  // ✅ 미복약 1회 추가 (임계값 도달 시 자동 리셋)
  const addMissOnce = async () => {
    const next = missedCount + 1;
    setMissedCount(next);
    await AsyncStorage.setItem(STORAGE_KEYS.missedCount, String(next));

    if (notificationEnabled && next >= missThreshold) {
      Alert.alert(
        '미복약 알림',
        `미복약 ${next}회 누적 — 임계값(${missThreshold}회)에 도달했습니다. 누적을 0으로 초기화합니다.`
      );
      // 자동 리셋
      setMissedCount(0);
      await AsyncStorage.setItem(STORAGE_KEYS.missedCount, '0');
    }
  };

  const decThreshold = () => setMissThreshold((v) => Math.max(1, v - 1));
  const incThreshold = () => setMissThreshold((v) => Math.min(20, v + 1));

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더: 전체 화면을 살짝 아래로 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      {/* 본문 */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 카드: 기본 알림 옵션 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>기본 알림</Text>

          {/* 푸시 알림 */}
          <View style={styles.row}>
            <Text style={styles.label}>푸시 알림</Text>
            <TouchableOpacity
              style={[styles.toggleButton, notificationEnabled ? styles.on : styles.off]}
              onPress={() => setNotificationEnabled(!notificationEnabled)}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleText}>{notificationEnabled ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </View>

          {/* 긴급 알림 */}
          <View style={styles.row}>
            <Text style={styles.label}>긴급 알림</Text>
            <TouchableOpacity
              style={[styles.toggleButton, emergencyAlert ? styles.emergencyOn : styles.off]}
              onPress={() => setEmergencyAlert(!emergencyAlert)}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleText}>{emergencyAlert ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </View>

          {/* 소리 설정 */}
          <View style={styles.row}>
            <Text style={styles.label}>소리 설정</Text>
            <TouchableOpacity
              style={[styles.toggleButton, soundEnabled ? styles.soundOn : styles.soundOff]}
              onPress={() => setSoundEnabled(!soundEnabled)}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleText}>{soundEnabled ? '소리' : '무음'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 카드: 미복약 임계값 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>미복약 알림 임계값</Text>
          <Text style={styles.helper}>
            설정한 횟수만큼 복약을 건너뛰면 알림이 울리고, 누적은 자동으로 0으로 초기화됩니다.
          </Text>

          <View style={[styles.row, { marginTop: 10 }]}>
            <Text style={styles.label}>임계값 (회)</Text>

            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={decThreshold} activeOpacity={0.7}>
                <Text style={styles.stepText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.stepValue}>{missThreshold}</Text>

              <TouchableOpacity style={styles.stepBtn} onPress={incThreshold} activeOpacity={0.7}>
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 12 }]}>
            <Text style={styles.label}>현재 미복약 누적</Text>
            <Text style={styles.badge}>{missedCount} 회</Text>
          </View>

          {/* 테스트/연동 버튼 */}
          <TouchableOpacity style={styles.secondaryBtn} onPress={addMissOnce} activeOpacity={0.8}>
            <Ionicons name="add-circle-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>테스트: 미복약 1회 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings} activeOpacity={0.85}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // 헤더가 위쪽을 메우면서 컨텐츠를 살짝 아래로
  header: {
    paddingTop: HEADER_SPACER,
    height: 56 + HEADER_SPACER,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPlaceholder: { width: 44, height: 44 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },

  scroll: { flex: 1 },
  // 중앙보다 살짝 위가 아닌, 자연스럽게 아래로 시작
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
    alignItems: 'center',
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EFE7E1',
    marginBottom: 16,
    width: '100%',
    maxWidth: 560,
    ...cardShadow,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  helper: { fontSize: 14, color: colors.textSecondary },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },

  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#ccc',
    minWidth: 68,
    alignItems: 'center',
  },
  on: { backgroundColor: '#4CAF50' },
  off: { backgroundColor: '#9E9E9E' },
  emergencyOn: { backgroundColor: '#F44336' },
  soundOn: { backgroundColor: '#2196F3' },
  soundOff: { backgroundColor: '#9E9E9E' },
  toggleText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  stepper: { flexDirection: 'row', alignItems: 'center', columnGap: 10 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
  },
  stepText: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  stepValue: { width: 40, textAlign: 'center', fontSize: 18, fontWeight: '800', color: colors.textPrimary },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.secondary,
    color: colors.textPrimary,
    fontWeight: '800',
  },

  secondaryBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    columnGap: 6,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },

  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    width: '100%',
    maxWidth: 560,
  },
  saveButtonText: { color: colors.onPrimary, fontSize: 18, fontWeight: '800' },
});
