import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const OCRCapture = () => {
  // 촬영한 사진의 URI를 저장할 state
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  // OCR 분석 결과를 저장할 state (현재는 사용되지 않음)
  const [ocrResult, setOcrResult] = useState<string | null>(null);

  /**
   * '촬영하기' 버튼을 눌렀을 때 실행되는 함수
   */
  const handleTakePhoto = async () => {
    // 1. 카메라 접근 권한을 요청합니다.
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라에 접근하려면 권한을 허용해야 합니다.');
      return;
    }

    // 2. 카메라를 실행합니다.
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: [ImagePicker.MediaType.Images],
        allowsEditing: true, // 촬영 후 편집 화면 표시 여부
        aspect: [4, 5],      // 편집 화면의 비율
        quality: 0.7,        // 이미지 품질 (0 ~ 1)
      });

      // 3. 사용자가 촬영을 취소하지 않았다면, 이미지 URI를 state에 저장합니다.
      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
        // TODO: 촬영된 이미지를 서버로 보내 OCR 분석을 요청하는 로직 추가
        // setOcrResult(await sendImageToServer(result.assets[0].uri));
      }
    } catch (error) {
      console.error("카메라 실행 중 오류 발생: ", error);
      Alert.alert("오류", "카메라를 실행하는 중 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 약 봉투를 촬영해 주세요</Text>
      
      {/* 촬영하기 버튼 (기존 Button 대신 TouchableOpacity로 보기 좋게 수정) */}
      <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
        <Text style={styles.buttonText}>촬영하기</Text>
      </TouchableOpacity>

      {/* 촬영된 사진이 있으면 화면에 미리보기를 표시합니다. */}
      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
      )}

      {/* OCR 분석 결과가 있으면 화면에 표시합니다. */}
      {ocrResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>OCR 분석 결과</Text>
          <Text style={styles.resultText}>{ocrResult}</Text>
        </View>
      )}
    </View>
  );
};

// UI 스타일 정의
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  preview: {
    width: 250,
    height: 250,
    marginVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F0F0F0'
  },
  resultBox: {
    marginTop: 15,
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 16,
  },
});

export default OCRCapture;