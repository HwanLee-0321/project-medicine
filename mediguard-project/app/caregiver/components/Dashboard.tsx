import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function Dashboard({ goToFunction }: any) {
  return (
    <View style={styles.container}>
      {/* 상단 탭 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeTabText}>대시보드</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.inactiveTab}
          onPress={goToFunction}
        >
          <Text style={styles.inactiveTabText}>기능</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>대시보드</Text>

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

      {/* 차트 제목 + 차트 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>주간 복약횟수</Text>
        <LineChart
          data={{
            labels: ["월", "화", "수", "목", "금"],
            datasets: [{ data: [3, 2, 5, 4, 2] }]
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

      {/* 알림 박스들 */}
      <View style={styles.alertBox}>
        <Text style={styles.alertText}>⚠️ 미복약 알림</Text>
        <Text style={styles.alertSubText}>8월 6일 아침약 미복용</Text>
      </View>
      <View style={styles.alertBox}>
        <Text style={styles.alertText}>🚨 이상징후 감지</Text>
        <Text style={styles.alertSubText}>어지러움 호소 (8월 6일)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 20,
    paddingTop: 80, // 화면을 아래로 내림
  },
  tabContainer: { flexDirection: 'row', marginBottom: 10 },
  activeTab: { flex: 1, backgroundColor: 'green', padding: 10, alignItems: 'center' },
  inactiveTab: { flex: 1, backgroundColor: '#ddd', padding: 10, alignItems: 'center' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  inactiveTabText: { color: '#000', fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  profileBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f0f0f0', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20 
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  profileText: { fontSize: 16 },
  
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000',
  },
  chart: { 
    borderRadius: 10, 
  },
  
  alertBox: {
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#ffcc00',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  alertText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertSubText: {
    fontSize: 15,
    color: '#555',
  },
});
