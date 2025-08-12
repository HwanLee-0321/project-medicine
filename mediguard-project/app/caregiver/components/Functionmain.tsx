import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

const Functionmain = () => {
  const navigation = useRouter();

  /**
   * '처방전 등록' 버튼 클릭 시 실행될 함수
   * 카메라 권한을 확인하고, 허용된 경우에만 OCR 페이지로 이동합니다.
   */
  const handlePressPrescription = async () => {
    // 1. 카메라 접근 권한을 요청합니다.
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    // 2. 권한이 허용되었다면 '/ocr' 페이지로 이동합니다.
    if (status === 'granted') {
      router.push('/ocr');
    } else {
      // 3. 권한이 거부되었다면 사용자에게 알림을 띄웁니다.
      Alert.alert(
        "권한 필요",
        "처방전 등록을 위해 카메라 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>기능</Text>
      <View style={styles.buttonContainer}>
        {/* 대시보드 */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.push("/caregiver/components/Dashboard")}
        >
          <Ionicons name="home-outline" size={32} color="#fff" />
          <Text style={styles.buttonText}>대시보드</Text>
        </TouchableOpacity>

        {/* 처방전 등록 */}
        <TouchableOpacity
          style={styles.button}
          onPress={handlePressPrescription} // 수정된 부분
        >
          <Ionicons name="camera-outline" size={32} color="#fff" />
          <Text style={styles.buttonText}>처방전 등록</Text>
        </TouchableOpacity>

        {/* 복약 기록 확인 */}
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Ionicons name="checkmark-done-circle-outline" size={32} color="#fff" />
          <Text style={styles.buttonText}>복약 기록 확인</Text>
        </TouchableOpacity>

        {/* 어르신 정보 */}
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Ionicons name="person-outline" size={32} color="#fff" />
          <Text style={styles.buttonText}>어르신 정보</Text>
        </TouchableOpacity>

        {/* 설정 */}
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Ionicons name="settings-outline" size={32} color="#fff" />
          <Text style={styles.buttonText}>설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f7f7f7",
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  button: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: "#3498db",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
});

export default Functionmain;