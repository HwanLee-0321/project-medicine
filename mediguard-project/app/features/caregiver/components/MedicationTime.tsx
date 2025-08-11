// components/MedicationTimeTab.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MedicationTimeTab() {
  const [morning, setMorning] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');

  // 앱 시작 시 저장된 시간 불러오기 + 로그 출력
  useEffect(() => {
    const loadTimes = async () => {
      try {
        const storedMorning = await AsyncStorage.getItem('med_morning');
        const storedLunch = await AsyncStorage.getItem('med_lunch');
        const storedDinner = await AsyncStorage.getItem('med_dinner');

        if (storedMorning) setMorning(storedMorning);
        if (storedLunch) setLunch(storedLunch);
        if (storedDinner) setDinner(storedDinner);

        console.log("💊 저장된 복약 시간 불러오기:");
        console.log(`아침: ${storedMorning || '(없음)'}`);
        console.log(`점심: ${storedLunch || '(없음)'}`);
        console.log(`저녁: ${storedDinner || '(없음)'}`);
      } catch (error) {
        console.error('시간 불러오기 실패:', error);
      }
    };

    loadTimes();
  }, []);

  // 저장 함수 + 로그 출력
  const saveTimes = async () => {
    try {
      await AsyncStorage.setItem('med_morning', morning);
      await AsyncStorage.setItem('med_lunch', lunch);
      await AsyncStorage.setItem('med_dinner', dinner);

      console.log("💊 복약 시간 저장됨:");
      console.log(`아침: ${morning}`);
      console.log(`점심: ${lunch}`);
      console.log(`저녁: ${dinner}`);

      Alert.alert('저장 완료', `아침: ${morning}\n점심: ${lunch}\n저녁: ${dinner}`);
    } catch (error) {
      console.error('시간 저장 실패:', error);
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: 'skyblue',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
