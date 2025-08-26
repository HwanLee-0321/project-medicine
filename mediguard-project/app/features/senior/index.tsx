// screens/Home.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, Text, View, Image } from 'react-native';
import { useRouter } from 'expo-router';


// 하위 컴포넌트
import CurrentTime from './components/CurrentTime';
import NextMedication from './components/NextMedication';
import { colors } from '@styles/colors';

// 경로는 프로젝트 구조에 맞게 조정
const mascot = require('@assets/images/mascot.png');

export default function Home() {
  const router = useRouter();

  return (

    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 1) 현재 시간 */}
        <CurrentTime />

        {/* 2) 캐릭터 + 말풍선 */}
        <View style={styles.mascotBlock}>
          <Image source={mascot} style={styles.mascot} resizeMode="contain" />

          {/* 말풍선 (버튼 폭과 동일: width 100%) */}
          <View style={styles.speechWrap}>
            <View style={styles.speechBubble}>
              <TouchableOpacity
                onPress={() => router.push('/Calendar')}
                accessibilityLabel="챗봇으로 이동"
              >
                <Text style={styles.bubbleText}>대화를 원하시면{'\n'}말풍선을 눌러주세요.</Text>
              </TouchableOpacity>
            </View>
            {/* 말풍선 꼬리 */}
            <View style={styles.tail} />
          </View>
        </View>

        {/* 3) 다음 복약 시간: 주황/피치 톤 카드 하나만 사용 */}
        <View style={styles.nextCard}>
          <NextMedication />
        </View>

        {/* 4) 건강 이력 달력 버튼 */}
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/Calendar')}
          accessibilityLabel="건강 이력 달력으로 이동"
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>건강 이력 달력</Text>
        </TouchableOpacity>

        {/* 5) 설정 버튼 */}
        <TouchableOpacity
          style={[styles.button, styles.settingsButton]}
          onPress={() => router.push('./senior/components/SettingsShortcut')}
          accessibilityLabel="설정 화면으로 이동"
        >
          <Text style={styles.buttonText}>⚙️ 설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center', // 세로 중앙
    alignItems: 'center',     // 가로 중앙
    gap: 22,
    paddingHorizontal: 20,
  },

  // 캐릭터 + 말풍선
  mascotBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  mascot: {
    width: 128,   // 살짝 더 크게
    height: 128,
  },
  speechWrap: {
    position: 'relative',
    width: '100%',        // 버튼과 동일 폭
    alignItems: 'center',
  },
  speechBubble: {
    width: '100%',        // 버튼과 동일 폭
    backgroundColor: colors.panel,
    borderRadius: RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#00000010',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  // 꼬리: 말풍선 우측 아래에서 캐릭터 방향으로
  tail: {
    position: 'absolute',
    right: 36,    // 필요하면 미세 조정
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 12,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.panel,
  },
  bubbleText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
  },

  // 다음 복약 카드(한 겹)
  nextCard: {
    width: '100%',
    backgroundColor: colors.panel, // 주황/피치 톤 카드 하나
    borderRadius: RADIUS * 1.2,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#00000010',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',

  },
  nextTitle: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '800',
  },

  // 버튼 공통
  button: {
    width: '100%',               // 버튼 폭 = 말풍선 폭
    borderRadius: RADIUS * 1.2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '800' },

  secondaryButton: { backgroundColor: colors.secondary },
  secondaryButtonText: { color: colors.onSecondary },

  settingsButton: { backgroundColor: colors.primary },
});
