// components/ReminderHandler.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import Tts from 'react-native-tts';

const ReminderHandler = () => {
  const [reminderActive, setReminderActive] = useState(false);

  // 시뮬레이션용: 앱 실행 5초 후 알림 수신
  useEffect(() => {
    const timer = setTimeout(() => {
      setReminderActive(true);
      // Tts.speak('약 드실 시간이에요. 복약하셨나요?');
    }, 5000); // 5초 후 알림 도착

    return () => clearTimeout(timer);
  }, []);

  const handleMedication = (status: string) => {
    // Tts.speak(status === 'done' ? '좋아요. 건강을 챙기셔서 기뻐요!' : '조금 있다가 꼭 드셔야 해요.');
    Alert.alert('알림', status === 'done' ? '복약 완료 처리되었습니다.' : '나중에 복약으로 기록되었습니다.');
    setReminderActive(false);
  };

  if (!reminderActive) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>💊 약 드실 시간이에요!</Text>
      <View style={styles.buttons}>
        <Button title="복약 완료" onPress={() => handleMedication('done')} />
        <Button title="나중에 복용" onPress={() => handleMedication('later')} color="#aaa" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fef9e7',
    borderRadius: 12,
    width: '100%',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default ReminderHandler;
