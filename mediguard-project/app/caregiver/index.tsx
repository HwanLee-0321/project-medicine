import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import Icons from '@expo/vector-icons/MaterialIcons';

const screenWidth = Dimensions.get("window").width;

export default function App() {
  const [screen, setScreen] = useState("login"); // 현재 화면
  const [tab, setTab] = useState("dashboard");   // 보호자 탭

  const medicationData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    datasets: [{ data: [3, 4, 2, 5, 3, 4, 1] }],
  };

  // ---------------- 보호자 화면 ----------------
  return (
    <View style={styles.container}>
      {/* Tab 버튼 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "dashboard" && styles.activeTab]}
          onPress={() => setTab("dashboard")}
        >
          <Text style={styles.tabText}>대시보드</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === "features" && styles.activeTab]}
          onPress={() => setTab("features")}
        >
          <Text style={styles.tabText}>기능</Text>
        </TouchableOpacity>
      </View>

      {/* 대시보드 화면 */}
      {tab === "dashboard" && (
        <ScrollView style={styles.content}>
          <Text style={styles.title}>📊 대시보드</Text>
          
          <View style={styles.userCard}>
            <Image source={{ uri: 'https://placekitten.com/100/100' }} style={styles.avatar} />
            <View>
              <Text style={styles.name}>대상자: 고령자</Text>
              <Text>상태: 정상</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>복약 현황</Text>
          <LineChart
            data={medicationData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            }}
            style={styles.chart}
          />

          <Text style={styles.sectionTitle}>건강 이상 징후</Text>
          <View style={styles.alertBox}>
            <Icons name="warning" size={20} color="red" />
            <Text style={{ marginLeft: 5 }}>최근 복약 거부 기록 있음</Text>
          </View>

          <Text style={styles.sectionTitle}>미복약 내역</Text>
          <View style={styles.alertBox}>
            <Icons name="notifications" size={20} color="orange" />
            <Text style={{ marginLeft: 5 }}>7/28 아침 약 미복용</Text>
          </View>

          <Button title="로그아웃" onPress={() => setScreen("login")} />
        </ScrollView>
      )}

      {/* 기능 탭 화면 */}
      {tab === "features" && (
        <View style={styles.content}>
          <Text style={styles.title}>⚙ 기능 탭</Text>
          <Button title="📆 식사/복약 시간 설정" onPress={() => {}} />
          <Button title="💬 캐릭터 음성 메시지 등록" onPress={() => {}} />
          <Button title="📁 이력 데이터 보기" onPress={() => {}} />
          <Button title="🔔 알림 설정" onPress={() => {}} />
          <Button title="뒤로가기" onPress={() => setScreen("login")} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  content: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  name: { fontSize: 18, fontWeight: '600' },
  sectionTitle: { fontSize: 18, marginTop: 20, marginBottom: 10 },
  chart: { borderRadius: 8 },
  alertBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  tabButton: { padding: 10, borderWidth: 1, borderColor: '#ccc', flex: 1, alignItems: 'center' },
  activeTab: { backgroundColor: '#4CAF50' },
  tabText: { color: '#000', fontSize: 16 },
});
