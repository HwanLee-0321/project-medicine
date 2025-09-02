import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function ElderHomeMock() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 현재 시간 표시 */}
      <Text style={styles.timeText}>🕒 현재 시간: 14:25</Text>

      {/* 마스코트 (애니메이션 자리) */}
      <View style={styles.mascotBox}>
        <Text style={styles.mascot}>🐶</Text>
        <Text style={{ fontSize: 16, marginTop: 8 }}>안녕하세요! OOO님</Text>
      </View>

      {/* 다음 복약 예정 안내 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💊 다음 복약 예정</Text>
        <Text style={styles.sectionContent}>15:00 - 점심 식후 약</Text>
      </View>

      {/* 복약 알림 도착 시 대응 (모의) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📢 알림 도착</Text>
        <Text style={styles.sectionContent}>약 드셨나요?</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>복용 완료</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#FFA000' }]}>
            <Text style={styles.buttonText}>아직 안 먹었어요</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* OCR 영역 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 OCR 촬영</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>약봉지/처방전 촬영하기</Text>
        </TouchableOpacity>
      </View>

      {/* 마스코트와 대화 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗣️ 오늘의 건강 체크</Text>
        <Text style={styles.sectionContent}>오늘 어디 아프신 데 있나요?</Text>
        <Text style={styles.sectionContent}>기분은 어떠세요?</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>음성으로 응답하기</Text>
        </TouchableOpacity>
      </View>

      {/* 설정 이동 */}
      <TouchableOpacity style={[styles.button, { backgroundColor: '#9E9E9E', marginTop: 20 }]}>
        <Text style={styles.buttonText}>⚙️ 설정 화면으로</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mascotBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mascot: {
    fontSize: 64,
  },
  section: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
});
