import { View, Text, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';

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
        <Image source={require('../../assets/images/mascot.png')} style={styles.image} />
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
    backgroundColor: 'rgba(255,255,255,0.95)',
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
  },
  message: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  sub: {
    fontSize: 14,
    color: '#777',
  },
});
