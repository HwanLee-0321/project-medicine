// app/roleSelect.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RoleSelectScreen() {
  const router = useRouter();

  const onSelectRole = (role: '보호자' | '대상자') => {
    Alert.alert(`${role} 선택 완료`, '대시보드 화면으로 이동합니다.');
    router.replace('/'); // 메인 대시보드로 이동 (프로젝트 경로에 맞게 조정 가능)
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* ← 뒤로가기 (왼쪽 상단, 살짝 아래) */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>역할 선택</Text>

        <TouchableOpacity
          style={[styles.button, styles.guardian]}
          onPress={() => onSelectRole('보호자')}
        >
          <Text style={styles.buttonText}>보호자</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.patient]}
          onPress={() => onSelectRole('대상자')}
        >
          <Text style={styles.buttonText}>대상자</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // 왼쪽 상단에서 살짝 아래로 위치
  backButton: {
    position: 'absolute',
    top: 150,   // 필요시 40~100 사이에서 조절
    left: 16,
    padding: 6,
    zIndex: 10,
  },
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
