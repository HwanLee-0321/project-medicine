import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import IntroOverlay from '../components/setup/IntroOverlay';
import { useRouter } from 'expo-router';

export default function SetupScreen() {
  const [showOverlay, setShowOverlay] = useState(true);
  const [morning, setMorning] = useState('08:00');
  const [lunch, setLunch] = useState('12:00');
  const [dinner, setDinner] = useState('18:00');

  const router = useRouter();

  const handleOverlayEnd = () => {
    setShowOverlay(false);
  };

  const handleFinishSetup = () => {
    // 유효성 검사 간단히 (생략 가능)
    if (!morning || !lunch || !dinner) {
      Alert.alert('모든 시간대를 입력해주세요!');
      return;
    }

    // TODO: AsyncStorage 등에 저장 가능
    console.log('설정된 시간:', { morning, lunch, dinner });

    Alert.alert('설정이 완료되었습니다!');
    router.push('/prescription'); // 촬영 화면으로 이동
  };

  return (
    <View style={styles.container}>
      {showOverlay ? (
        <IntroOverlay onFinish={handleOverlayEnd} userName="000" />
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>복약 시간 설정</Text>

          <TimeInput label="아침" value={morning} onChangeText={setMorning} />
          <TimeInput label="점심" value={lunch} onChangeText={setLunch} />
          <TimeInput label="저녁" value={dinner} onChangeText={setDinner} />

          <TouchableOpacity onPress={handleFinishSetup} style={styles.mascotBox}>
            <Image source={require('../assets/images/mascot.png')} style={styles.mascot} />
            <Text style={styles.mascotText}>다 됐으면 저를 눌러주세요!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function TimeInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (val: string) => void }) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="HH:MM"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 15,
  },
  label: {
    fontSize: 18, width: 60,
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8,
  },
  mascotBox: {
    alignItems: 'center', marginTop: 40,
  },
  mascot: {
    width: 120, height: 120, resizeMode: 'contain',
  },
  mascotText: {
    marginTop: 10, fontSize: 16, color: '#4E88FF',
  },
});
