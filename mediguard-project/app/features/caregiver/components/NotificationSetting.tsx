// components/NotificationSettingTab.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function NotificationSettingTab() {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.modalTitle}>알림 설정</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>푸시 알림</Text>
          <TouchableOpacity
            style={[styles.toggleButton, notificationEnabled && styles.toggleOn]}
            onPress={() => setNotificationEnabled(!notificationEnabled)}
          >
            <Text style={styles.toggleText}>{notificationEnabled ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>긴급 알림</Text>
          <TouchableOpacity
            style={[styles.toggleButton, emergencyAlert ? styles.emergencyOn : null]}
            onPress={() => setEmergencyAlert(!emergencyAlert)}
          >
            <Text style={styles.toggleText}>{emergencyAlert ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>소리 설정</Text>
          <TouchableOpacity
            style={[styles.toggleButton, soundEnabled ? styles.soundOn : styles.soundOff]}
            onPress={() => setSoundEnabled(!soundEnabled)}
          >
            <Text style={styles.toggleText}>{soundEnabled ? '소리' : '무음'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.2)' // 살짝 반투명 배경
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
    elevation: 5, // 그림자 (안드로이드)
    shadowColor: '#000', // 그림자 (iOS)
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
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
    backgroundColor: '#F44336',
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
