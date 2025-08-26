// app/features/caregiver/components/FunctionMain.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';

export default function FunctionMain() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<'dashboard' | 'function'>('function');

  // ✅ 상단 탭 + 설정 버튼
  const renderTopTabs = () => (
    <View style={styles.topBar}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, mainTab === 'dashboard' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setMainTab('dashboard')}
        >
          <Text style={mainTab === 'dashboard' ? styles.activeTabText : styles.inactiveTabText}>
            대시보드
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mainTab === 'function' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setMainTab('function')}
        >
          <Text style={mainTab === 'function' ? styles.activeTabText : styles.inactiveTabText}>
            기능
          </Text>
        </TouchableOpacity>
      </View>

      {/* ⚙️ 설정 버튼 */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => {
          setMainTab('function');
        }}
      >
        <Text style={{ fontSize: 20, color: '#333' }}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDashboard = () => (
    <ScrollView
      style={styles.dashboardContainer}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
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
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            labelColor: () => '#000',
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.alertBox}>
        <Text style={styles.alertText}>⚠️ 미복약 알림</Text>
        <Text style={styles.alertSubText}>8월 6일 아침약 미복용</Text>
      </View>
      <View style={styles.alertBox}>
        <Text style={styles.alertText}>🚨 이상징후 감지</Text>
        <Text style={styles.alertSubText}>어지러움 호소 (8월 6일)</Text>
      </View>
    </ScrollView>
  );

  const renderFunctionHome = () => (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: 180,
        paddingBottom: 20,
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { marginBottom: 30 }]}>기능 화면</Text>

      <View style={styles.cardContainer}>
        {/* 복약/시간설정 */}
        <TouchableOpacity
          style={[styles.card, styles.blueCard]}
          onPress={() => router.push('/features/caregiver/components/MedicationTime')}
        >
          <Text style={styles.cardText}>복약/시간설정</Text>
        </TouchableOpacity>

        {/* 이력 데이터 확인 */}
        <TouchableOpacity
          style={[styles.card, styles.redCard]}
          onPress={() => router.push('/Calendar')}
        >
          <Text style={styles.cardText}>이력 데이터 확인</Text>
        </TouchableOpacity>

        {/* 알림 설정 */}
        <TouchableOpacity
          style={[styles.card, styles.yellowCard]}
          onPress={() => router.push('/features/caregiver/components/NotificationSetting')}
        >
          <Text style={[styles.cardText, { color: '#000' }]}>알림 설정</Text>
        </TouchableOpacity>

        {/* 역할 선택 */}
        <TouchableOpacity
          style={[styles.card, styles.greenCard]}
          onPress={() => router.push('/features/caregiver/components/roleSelect')}
        >
          <Text style={styles.cardText}>역할 선택</Text>
        </TouchableOpacity>

        {/* 로그인 */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#9C27B0' }]}
          onPress={() => router.push('/features/caregiver/components/login')}
        >
          <Text style={styles.cardText}>로그인</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1 }}>
      {renderTopTabs()}
      <View style={{ flex: 1 }}>
        {mainTab === 'dashboard' && renderDashboard()}
        {mainTab === 'function' && renderFunctionHome()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  settingsButton: {
    padding: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  inactiveTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  inactiveTab: {},

  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold' },

  cardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  card: {
    width: '40%',
    height: 100,
    margin: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  blueCard: { backgroundColor: '#2196F3' },
  redCard: { backgroundColor: '#F44336' },
  yellowCard: { backgroundColor: '#FFEB3B' },
  greenCard: { backgroundColor: '#4CAF50' },

  dashboardContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  profileText: { fontSize: 16 },

  chartContainer: { marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#000' },
  chart: { borderRadius: 10 },

  alertBox: {
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#ffcc00',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  alertText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  alertSubText: { fontSize: 15, color: '#555' },
});
