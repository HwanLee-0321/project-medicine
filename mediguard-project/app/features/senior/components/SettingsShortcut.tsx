import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 뒤로가기 아이콘용 (expo 사용 시)

export default function SettingsShortcut({ onBack }: { onBack: () => void }) {
  const [voiceGuideEnabled, setVoiceGuideEnabled] = useState(false);

  return (
    <View style={styles.container}>
      {/* 상단바 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 24 }} /> {/* 아이콘 오른쪽 빈 공간 */}
      </View>

      {/* 음성 안내 */}
      <View style={styles.row}>
        <Text style={styles.label}>음성 안내</Text>
        <Switch
          value={voiceGuideEnabled}
          onValueChange={setVoiceGuideEnabled}
          trackColor={{ false: '#ccc', true: '#3366FF' }}
          thumbColor={voiceGuideEnabled ? '#fff' : '#fff'}
        />
      </View>

      {/* 기타 버튼들 */}
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>복약 시간 재설정</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>복약 목록 수정</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>사용자 유형 변경</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 100,
    justifyContent: 'flex-start', // 세로 가운데 정렬
    alignItems: 'center',     // 가로 가운데 정렬
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 15,
    alignItems: 'center',
    width: '100%',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
