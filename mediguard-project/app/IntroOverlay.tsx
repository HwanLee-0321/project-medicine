import { View, Text, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';
import { colors } from '@styles/colors'; // 색상 팔레트 불러오기

interface Props {
  userName: string;      // 메시지 안에 들어갈 사용자 이름
  onFinish: () => void;  // 인트로가 끝나면 실행될 함수
}

const messages = [
  '처음 뵙겠습니다!',
  '저는 {name}님의 약 복용과 건강 관리를 도와드릴 예정이에요.',
  '약을 복용할 시간을 설정해주세요!',
];

export default function IntroOverlay({ userName, onFinish }: Props) {
  const [step, setStep] = useState(0);

  const handlePress = () => {
    if (step < messages.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const getMessage = () =>
    messages[step].replace('{name}', userName);

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.overlay}>
        <Image source={require('@assets/images/mascot.png')} style={styles.image} />
        <View style={styles.messageBox}>
          <Text style={styles.message}>{getMessage()}</Text>
          <Text style={styles.sub}>화면을 터치하면 다음으로 넘어갑니다</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  messageBox: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: colors.textPrimary,
  },
  sub: {
    fontSize: 18,
    color: colors.textPrimary, // 더 진한 색상 사용
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
