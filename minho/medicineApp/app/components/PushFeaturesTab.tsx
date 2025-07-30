import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';

import * as Notifications from 'expo-notifications';

const PushFeaturesTab = () => {
  const [doseThreshold, setDoseThreshold] = useState('3'); // 기본값 3회
  const [currentScreen, setCurrentScreen] = useState('notifications');

  // 로컬 알림 함수
  const sendNotification = async (message: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📢 복약 알림",
        body: message,
      },
      trigger: null,
    });
  };

  return (
    <View>
      {currentScreen === "notifications" && (
        <>
          <Text style={styles.title}>🔔 알림 설정</Text>
          <Text>몇 번 복약했을 때 알림을 받을지 설정하세요.</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={doseThreshold}
            onChangeText={setDoseThreshold}
          />
          <Button
            title="저장"
            onPress={() => {
              alert(`설정 완료! ${doseThreshold}번 먹으면 알림이 옵니다.`);
              setCurrentScreen("main");
            }}
          />
          <Button
            title="뒤로가기"
            onPress={() => setCurrentScreen("main")}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    fontSize: 16,
  },
});

export default PushFeaturesTab;
