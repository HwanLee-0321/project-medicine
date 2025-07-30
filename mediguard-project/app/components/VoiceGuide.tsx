import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import Voice from '@react-native-voice/voice';

const VoiceGuide = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      const spoken = event.value?.[0] || '';
      setRecognizedText(spoken);
      handleResponse(spoken);
      setIsRecording(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecording = async () => {
    setRecognizedText('');
    setResponse('');
    setIsRecording(true);
    try {
      await Voice.start('ko-KR');
    } catch (e) {
      console.error('Voice start error:', e);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Voice stop error:', e);
    }
  };

  const handleResponse = (text: string) => {
    const lowered = text.toLowerCase();
    if (lowered.includes('어지럽')) {
      setResponse('어지러우시군요. 보호자에게 알려드릴까요?');
    } else if (lowered.includes('괜찮')) {
      setResponse('다행이에요. 건강 잘 챙기세요!');
    } else if (lowered.includes('아파') || lowered.includes('통증')) {
      setResponse('어디가 아프신가요? 더 자세히 알려주세요.');
    } else {
      setResponse('말씀을 잘 이해하지 못했어요. 다시 한 번 말씀해 주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎤 마스코트와 대화</Text>
      <Button
        title={isRecording ? '말씀 중...' : '건강 상태 말하기'}
        onPress={isRecording ? stopRecording : startRecording}
        color={isRecording ? '#f39c12' : '#2e86de'}
      />
      {isRecording && <ActivityIndicator style={{ marginTop: 10 }} />}

      {recognizedText ? (
        <Text style={styles.result}>🗣️ "{recognizedText}"</Text>
      ) : null}

      {response ? (
        <Text style={styles.response}>🤖 {response}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: '500',
  },
  result: {
    marginTop: 16,
    fontSize: 18,
    fontStyle: 'italic',
    color: '#444',
  },
  response: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
});

export default VoiceGuide;
