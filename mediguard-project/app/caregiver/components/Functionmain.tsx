import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';

export default function FunctionMain({ goToDashboard }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);

  const [morning, setMorning] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');

  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const saveTimes = () => {
    Alert.alert('저장 완료', `아침: ${morning}\n점심: ${lunch}\n저녁: ${dinner}`);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerWrapper}>
        <Text style={styles.title}>기능 화면</Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={[styles.card, styles.blueCard]} onPress={() => setModalVisible(true)}>
            <Text style={styles.cardText}>복약/시간설정</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.redCard]} onPress={() => Alert.alert('이력 데이터 확인')}>
            <Text style={styles.cardText}>이력 데이터 확인</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.yellowCard]} onPress={() => setAlertModalVisible(true)}>
            <Text style={[styles.cardText, { color: '#000' }]}>알림 설정</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.greenCard]} onPress={() => Alert.alert('기타 기능')}>
            <Text style={styles.cardText}>기타</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={goToDashboard}>
        <Text style={styles.buttonText}>← 대시보드로 돌아가기</Text>
      </TouchableOpacity>

      {/* 복약/시간설정 모달 */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>복약 시간 입력</Text>

            <TextInput 
              style={styles.input} 
              placeholder="아침 식사 시간" 
              value={morning} 
              onChangeText={setMorning} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="점심 식사 시간" 
              value={lunch} 
              onChangeText={setLunch} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="저녁 식사 시간" 
              value={dinner} 
              onChangeText={setDinner} 
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveTimes}>
              <Text style={styles.buttonText}>저장</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 알림 설정 모달 */}
      <Modal visible={alertModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>알림 설정</Text>

            {/* 푸시 알림 토글 */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>푸시 알림</Text>
              <TouchableOpacity
                style={[styles.toggleButton, notificationEnabled && styles.toggleOn]}
                onPress={() => setNotificationEnabled(!notificationEnabled)}
              >
                <Text style={styles.toggleText}>{notificationEnabled ? "ON" : "OFF"}</Text>
              </TouchableOpacity>
            </View>

            {/* 긴급 알림 토글 */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>긴급 알림</Text>
              <TouchableOpacity
                style={[styles.toggleButton, emergencyAlert ? styles.emergencyOn : null]}
                onPress={() => setEmergencyAlert(!emergencyAlert)}
              >
                <Text style={styles.toggleText}>{emergencyAlert ? "ON" : "OFF"}</Text>
              </TouchableOpacity>
            </View>

            {/* 소리/무음 버튼 */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>소리 설정</Text>
              <TouchableOpacity
                style={[styles.toggleButton, soundEnabled ? styles.soundOn : styles.soundOff]}
                onPress={() => setSoundEnabled(!soundEnabled)}
              >
                <Text style={styles.toggleText}>{soundEnabled ? "소리" : "무음"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setAlertModalVisible(false)}>
              <Text style={styles.buttonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center' },
  centerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },

  cardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  card: { 
    width: '40%', height: 100, 
    margin: 10, borderRadius: 15, 
    justifyContent: 'center', alignItems: 'center' 
  },
  cardText: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center' },

  blueCard: { backgroundColor: '#2196F3' },
  redCard: { backgroundColor: '#F44336' },
  yellowCard: { backgroundColor: '#FFEB3B' },
  greenCard: { backgroundColor: '#4CAF50' },

  backButton: { backgroundColor: 'gray', padding: 15, marginBottom: 30, borderRadius: 10, width: '80%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18 },

  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', width: '100%', padding: 10, marginVertical: 5, borderRadius: 8 },
  saveButton: { backgroundColor: 'green', padding: 12, marginTop: 10, borderRadius: 8, width: '100%', alignItems: 'center' },
  cancelButton: { backgroundColor: 'red', padding: 12, marginTop: 10, borderRadius: 8, width: '100%', alignItems: 'center' },

  // 알림 설정 스타일
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  toggleOn: {
    backgroundColor: '#4CAF50',
  },
  emergencyOn: {
    backgroundColor: '#F44336', // 긴급 알림 ON 시 빨간색
  },
  soundOn: {
    backgroundColor: '#2196F3',
  },
  soundOff: {
    backgroundColor: '#9E9E9E',
  },
  toggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
