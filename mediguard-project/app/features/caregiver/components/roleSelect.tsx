// app/roleSelect.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function RoleSelectScreen() {
  const router = useRouter();

  const onSelectRole = (role: '보호자' | '대상자') => {
    Alert.alert(`${role} 선택 완료`, '대시보드 화면으로 이동합니다.');
    router.replace('/'); // 메인 대시보드로 이동 (경로 상황에 맞게 수정)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>역할 선택</Text>

      <TouchableOpacity style={[styles.button, styles.guardian]} onPress={() => onSelectRole('보호자')}>
        <Text style={styles.buttonText}>보호자</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.patient]} onPress={() => onSelectRole('대상자')}>
        <Text style={styles.buttonText}>대상자</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  button: {
    width: '60%',
    paddingVertical: 16,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  guardian: { backgroundColor: '#2196F3' },
  patient: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
