import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';

interface FeaturesTabProps {
  onBack: () => void;
}

type SubScreen = "main" | "time" | "voice" | "history" | "notifications";

const FeaturesTab: React.FC<FeaturesTabProps> = ({ onBack }) => {
  const [currentScreen, setCurrentScreen] = useState<SubScreen>("main");

  // 시간 입력 상태
  const [breakfastTime, setBreakfastTime] = useState('');
  const [lunchTime, setLunchTime] = useState('');
  const [dinnerTime, setDinnerTime] = useState('');

  const handleSave = () => {
    alert(
      `저장 완료!\n🍽 아침: ${breakfastTime}\n🥗 점심: ${lunchTime}\n🍛 저녁: ${dinnerTime}`
    );
    setCurrentScreen("main"); // 저장 후 메인 메뉴로
  };

  return (
    <View style={styles.container}>
      {/* 메인 메뉴 */}
      {currentScreen === "main" && (
        <>
          <Text style={styles.title}>⚙ 기능 탭</Text>
          <Button title="📆 식사/복약 시간 설정" onPress={() => setCurrentScreen("time")} />
          <Button title="📁 이력 데이터 보기" onPress={() => setCurrentScreen("history")} />
          <Button title="🔔 알림 설정" onPress={() => setCurrentScreen("notifications")} />
          <Button title="뒤로가기" onPress={onBack} />
        </>
      )}

      {/* 식사/복약 시간 설정 */}
      {currentScreen === "time" && (
        <>
          <Text style={styles.title}>🕒 복약 시간 설정</Text>
          <Text style={styles.label}>🍳 아침 시간 (HH:MM)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 08:00"
            keyboardType="numeric"
            value={breakfastTime}
            onChangeText={setBreakfastTime}
          />
          <Text style={styles.label}>🥗 점심 시간 (HH:MM)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 12:30"
            keyboardType="numeric"
            value={lunchTime}
            onChangeText={setLunchTime}
          />
          <Text style={styles.label}>🍛 저녁 시간 (HH:MM)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 18:30"
            keyboardType="numeric"
            value={dinnerTime}
            onChangeText={setDinnerTime}
          />
          <Button title="저장" onPress={handleSave} />
          <Button title="뒤로가기" onPress={() => setCurrentScreen("main")} />
        </>
      )}


      {/* 이력 데이터 보기 */}
      {currentScreen === "history" && (
        <>
          <Text style={styles.title}>📁 이력 데이터 보기</Text>
          <Text>과거 복약 이력을 보여주는 화면 (추후 구현)</Text>
          <Button title="뒤로가기" onPress={() => setCurrentScreen("main")} />
        </>
      )}

      {/* 알림 설정 */}
      {currentScreen === "notifications" && (
        <>
          <Text style={styles.title}>🔔 알림 설정</Text>
          <Text>푸시 알림 ON/OFF 및 알림 시간 설정</Text>
          <Button title="뒤로가기" onPress={() => setCurrentScreen("main")} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 18, marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    fontSize: 16,
  },
});

export default FeaturesTab;
