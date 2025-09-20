// app/features/caregiver/components/FunctionMain.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
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

export default function FunctionMain() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 상단바: 대시보드 제목만 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>대시보드</Text>
      </View>

      {/* 대시보드 본문 */}
      <ScrollView
        style={styles.dashboardContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 박스 */}
        <View style={styles.profileBox}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png' }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.profileText}>대상자: 김노인</Text>
            <Text style={styles.profileText}>상태: 정상</Text>
          </View>
        </View>

        {/* 차트 */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>주간 복약횟수</Text>
          <LineChart
            data={{
              labels: ['월', '화', '수', '목', '금'],
              datasets: [{ data: [3, 2, 5, 4, 2] }],
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: colors.white,
              backgroundGradientFrom: colors.white,
              backgroundGradientTo: colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              labelColor: () => colors.textPrimary,
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* 알림들 */}
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>⚠️ 미복약 알림</Text>
          <Text style={styles.alertSubText}>8월 6일 아침약 미복용</Text>
        </View>
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>🚨 이상징후 감지</Text>
          <Text style={styles.alertSubText}>어지러움 호소 (8월 6일)</Text>
        </View>

        {/* ▼ 설정 버튼 (이상징후 감지 아래, 카드 형태) */}
        <TouchableOpacity
          style={styles.settingsCard}
          activeOpacity={0.8}
          onPress={() => router.push('/features/caregiver/components/SettingsMenu')}
        >
          <View style={styles.settingsLeft}>
            <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
            <Text style={styles.settingsText}>설정</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // 상단 헤더: 타이틀만 중앙 정렬
  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },

  // 대시보드
  dashboardContainer: { flex: 1, backgroundColor: colors.background, padding: 20 },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginBottom: 20,
    ...cardShadow,
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  profileText: { fontSize: 16, color: colors.textPrimary },

  chartContainer: { marginBottom: 20 },
  chartTitle: {
    fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: colors.textPrimary,
  },
  chart: { borderRadius: 12, backgroundColor: colors.white, ...cardShadow },

  alertBox: {
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#ffcc00',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  alertText: {
    fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4,
  },
  alertSubText: { fontSize: 15, color: colors.textSecondary },

  // 설정 카드 버튼
  settingsCard: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EFE7E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...cardShadow,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
