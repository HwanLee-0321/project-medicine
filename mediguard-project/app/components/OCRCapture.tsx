import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { launchCamera } from 'react-native-image-picker';

const OCRCapture = () => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);

  const handleCapture = async () => {
    const result = await launchCamera({ mediaType: 'photo', cameraType: 'back' });

    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri || null;
      setPhotoUri(uri);

      // 👇 여기에서 실제 OCR 분석 대신 시뮬레이션
      setTimeout(() => {
        setOcrResult('타이레놀 500mg\n하루 3회 복용');
      }, 1000); // OCR 분석 중 느낌 주기
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 약 봉투를 촬영해 주세요</Text>
      <Button title="촬영하기" onPress={handleCapture} />

      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
      )}

      {ocrResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>OCR 분석 결과</Text>
          <Text style={styles.resultText}>{ocrResult}</Text>
        </View>
      )}
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
  preview: {
    width: 220,
    height: 220,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  resultBox: {
    marginTop: 12,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultText: {
    fontSize: 16,
    marginTop: 4,
  },
});

export default OCRCapture;
