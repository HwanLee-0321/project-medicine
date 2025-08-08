import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Switch} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SettingsShortcut = () => {
  
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [mealTimes, setMealTimes] = useState({
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '18:00',
  });

  const handleTimeChange = (meal: string, time: string) => {
    setMealTimes(prev => ({ ...prev, [meal]: time }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ 설정</Text>

      {/* 음성 안내 설정 */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>음성 안내</Text>
        <Switch
          value={voiceEnabled}
          onValueChange={setVoiceEnabled}
        />
      </View>

      {/* 글씨 크기 설정 */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>글씨 크기</Text>
        <View style={styles.buttonGroup}>
          <Button title="작게" onPress={() => setFontSize('small')} />
          <Button title="보통" onPress={() => setFontSize('medium')} />
          <Button title="크게" onPress={() => setFontSize('large')} />
        </View>
      </View>

      {/* 식사 시간 설정 */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>식사 시간</Text>
        <View style={styles.mealTimes}>
          <Text>아침: {mealTimes.breakfast}</Text>
          <Text>점심: {mealTimes.lunch}</Text>
          <Text>저녁: {mealTimes.dinner}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  settingRow: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  mealTimes: {
    marginTop: 8,
    gap: 4,
  },
});

export default SettingsShortcut;
