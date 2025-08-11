import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';

import CalendarTab from './Calendar';
import MedicationTimeTab from './MedicationTime';
import NotificationSettingTab from './NotificationSetting';

export default function FunctionMain({ goToDashboard }: any) {
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'medTime' | 'notification' | 'other'>('home');

  // 홈(기능 버튼 4개) 화면
  if (activeTab === 'home') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>기능 화면</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={[styles.card, styles.blueCard]} onPress={() => setActiveTab('medTime')}>
            <Text style={styles.cardText}>복약/시간설정</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.redCard]} onPress={() => setActiveTab('calendar')}>
            <Text style={styles.cardText}>이력 데이터 확인</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.yellowCard]} onPress={() => setActiveTab('notification')}>
            <Text style={[styles.cardText, { color: '#000' }]}>알림 설정</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.greenCard]} onPress={() => Alert.alert('기타 기능')}>
            <Text style={styles.cardText}>기타</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={goToDashboard}>
          <Text style={styles.buttonText}>← 대시보드로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 각 탭 컴포넌트 렌더링 + 뒤로가기 버튼
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.topLeftBackButton} onPress={() => setActiveTab('home')}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {activeTab === 'calendar' && <CalendarTab />}
      {activeTab === 'medTime' && <MedicationTimeTab />}
      {activeTab === 'notification' && <NotificationSettingTab />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
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
  backButton: {
    backgroundColor: 'gray',
    padding: 15,
    marginTop: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18 },
  topLeftBackButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    padding: 10,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333',
  },
});
