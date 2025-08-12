import React, { useState } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// 약 정보에 대한 타입 정의
interface Medication {
  MED_NM: string;
  TIMES_PER_DAY: number;
  DURATION_DAYS: number;
  DOSAGE: number;
}

// 서버 응답 전체에 대한 타입 정의
interface OcrResponse {
  medicines: Medication[];
  CREATED_AT: string;
  error?: string;
  raw_text?: string;
}

const OCRScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrResponse, setOcrResponse] = useState<OcrResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['Images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setOcrResponse(null);
    }
  };

  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setOcrResponse(null);
    }
  };

  const handleOcrScan = async () => {
    if (!imageUri) {
      Alert.alert('이미지 없음', '먼저 스캔할 이미지를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setOcrResponse(null);

    const formData = new FormData();
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    // Convert image URI to Blob
    const imageFetchResponse = await fetch(imageUri);
    const blob = await imageFetchResponse.blob();

    formData.append('file', blob, `photo.${fileType}`);

    const serverUrl = 'http://192.168.111.134:8081/upload-image/';

    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        body: formData,
      });

      const responseData: OcrResponse = await response.json();
      console.log("OCR 분석 결과 (JSON):", JSON.stringify(responseData, null, 2));

      if (!response.ok || responseData.error) {
        throw new Error(responseData.error || '서버에서 오류가 발생했습니다.');
      }
      
      setOcrResponse(responseData);

    } catch (error: any) {
      console.error('OCR 요청 오류:', error);
      Alert.alert('OCR 스캔 실패', `스캔 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 각 약품 항목을 렌더링하는 컴포넌트
  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <View style={styles.medicationItem}>
      <Text style={styles.medicationName}>{item.MED_NM}</Text>
      <Text>1회 투여량: {item.DOSAGETIMES_PER_DAY}정</Text>
      <Text>하루 복용 횟수: {item.TIMES_PER_DAY}회</Text>
      <Text>총 복용 일수: {item.DURATION_DAYS}일</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>처방전 OCR 스캔</Text>

      <View style={styles.buttonContainer}>
        <Button title="갤러리에서 선택" onPress={selectImageFromGallery} />
        <Button title="카메라로 촬영" onPress={takePhotoWithCamera} />
      </View>

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          <Button title="스캔하기" onPress={handleOcrScan} disabled={isLoading} />
        </View>
      )}

      {isLoading && <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 20 }} />}

      {ocrResponse && ocrResponse.medicines && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>OCR 분석 결과</Text>
          <Text style={styles.dateText}>분석 시각: {ocrResponse.CREATED_AT}</Text>
          <FlatList
            data={ocrResponse.medicines}
            renderItem={renderMedicationItem}
            keyExtractor={(item, index) => `${item.MED_NM}-${index}`}
            scrollEnabled={false} // ScrollView 안에 있으므로 자체 스크롤 비활성화
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  medicationItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default OCRScreen;