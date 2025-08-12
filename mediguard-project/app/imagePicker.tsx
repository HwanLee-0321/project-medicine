import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router'; // ✅ Href 타입 가져오기
import { colors } from '@styles/colors';


const messages = [
  '처방전 사진을 찍어볼까요?\n저를 터치해주세요!',
  '사진을 확인해주세요!',
];

const ImagePickerScreen: React.FC = () => {
  const [image, setImage] = useState<Asset | null>(null);
  const [step, setStep] = useState(0);
  const router = useRouter();

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한 요청',
            message: '사진을 찍기 위해 카메라 권한이 필요합니다.',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleMascotPress = () => {
    if (!image) handleImagePick();
  };

  const handleImagePick = () => {
    Alert.alert(
      '사진 선택',
      '사진을 선택할 방법을 고르세요.',
      [
        { text: '카메라로 촬영', onPress: openCamera },
        { text: '갤러리에서 선택', onPress: openGallery },
        { text: '취소', style: 'cancel' }, // 취소 시 상태 변화 없음
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    const result = await launchCamera({ mediaType: 'photo' });
    if (result.assets?.length) {
      setImage(result.assets[0]);
      setStep(1);
    }
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets?.length) {
      setImage(result.assets[0]);
      setStep(1);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setStep(0);
  };

  // ⬇️ “다음” → /ocr-processing 로 이동 (객체 href + 타입 보장)
  const handleNext = () => {
    const uri = image?.uri;
    if (!uri) {
      Alert.alert('사진을 선택해주세요!');
      return;
    }
    const href: Href = { pathname: '/ocr-processing', params: { uri } };
    router.push(href);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={handleMascotPress} style={styles.mascotBox} activeOpacity={0.85}>
          <Image source={require('@assets/images/mascot.png')} style={styles.mascot} />
        </TouchableOpacity>

        <Text style={styles.mascotText}>{messages[step]}</Text>

        {step === 1 && (
          <>
            <Image source={{ uri: image?.uri }} style={styles.preview} />
            <View style={styles.buttonCol}>
              <TouchableOpacity
                onPress={handleNext}
                style={[styles.button, styles.buttonPrimary, !image && styles.buttonDisabled]}
                disabled={!image}
              >
                <Text style={styles.buttonTextPrimary}>다음</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleRetake} style={[styles.button, styles.buttonSecondary]}>
                <Text style={styles.buttonTextSecondary}>다시 선택</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1, // ✅ ScrollView가 전체 높이 사용
    justifyContent: 'center', // ✅ 세로 중앙 정렬
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40, // 필요 시 여백 조정
  },
  mascotBox: { alignItems: 'center', marginTop: 12 },
  mascot: { width: 120, height: 120, resizeMode: 'contain' },
  mascotText: {
    marginTop: 12,
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  preview: {
    width: 260,
    height: 260,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  buttonCol: {
    marginTop: 18,
    width: '100%',
    maxWidth: 420,
    gap: 10,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextPrimary: {
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: colors.onSecondary,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ImagePickerScreen;
