import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';

const messages = [
  '처방전 사진을 찍어볼까요?\n저를 터치해주세요!',
  '사진을 확인해주세요!',
];

const ImagePickerExample: React.FC = () => {
  const [image, setImage] = useState<Asset | null>(null);
  const [step, setStep] = useState(0); // 0: 촬영 유도 / 1: 확인 안내

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
    return true; // iOS는 별도 런타임 권한 요청 불필요
  };

  // 캐릭터 터치 시: 선택 알럿만 띄움 (취소 시 아무 변화 없음)
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
        { text: '취소', style: 'cancel' }, // 변화 없음
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
      setStep(1); // 실제로 이미지가 생겼을 때만 문구 변경
    } else if (result.errorMessage) {
      console.log('카메라 오류:', result.errorMessage);
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
    setStep(0); // 처음 문구로
  };

  const handleNext = () => {
    // TODO: 다음 화면으로 이동 (예: router.push('/next') 또는 navigation.navigate('Next'))
    console.log('다음 화면으로 이동');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleMascotPress} style={styles.mascotBox} activeOpacity={0.8}>
        <Image source={require('../assets/images/mascot.png')} style={styles.mascot} />
      </TouchableOpacity>

      {/* 메시지 */}
      <Text style={styles.mascotText}>{messages[step]}</Text>

      {/* 이미지 미리보기 + 액션 버튼 */}
      {image && (
        <>
          <Image source={{ uri: image.uri }} style={styles.preview} />
          <View style={styles.buttonRow}>
            <Button title="다시 찍기" onPress={handleRetake} />
            <Button title="다음" onPress={handleNext} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  mascotBox: { alignItems: 'center', marginTop: 40 },
  mascot: { width: 120, height: 120, resizeMode: 'contain' },
  mascotText: { marginTop: 12, fontSize: 22, textAlign: 'center' },
  preview: { width: 240, height: 240, marginTop: 20, borderRadius: 12 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
});

export default ImagePickerExample;
