import React, { useState } from 'react';
import {
  View, Button, Image, StyleSheet, PermissionsAndroid, Platform, Alert, TouchableOpacity, Text
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';

const messages = [
  '처방전 사진을 찍어볼까요?',
  '사진을 확인해주세요!'
];

const ImagePickerExample: React.FC = () => {
  const [image, setImage] = useState<Asset | null>(null);

  const [step, setStep] = useState(0);

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한 요청',
            message: '사진을 찍기 위해 카메라 권한이 필요합니다.',
            buttonPositive: '허용',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleImagePick = () => {
    Alert.alert(
      '사진 선택',
      '사진을 선택할 방법을 고르세요.',
      [
        {
          text: '카메라로 촬영',
          onPress: openCamera,
        },
        {
          text: '갤러리에서 선택',
          onPress: openGallery,
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      console.log('카메라 권한 거부됨');
      return;
    }

    const result = await launchCamera({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    } else if (result.errorMessage) {
      console.log('카메라 오류:', result.errorMessage);
    }
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleImagePick} style={styles.mascotBox}>
        <Image source={require('../assets/images/mascot.png')} style={styles.mascot} />
      </TouchableOpacity>
      {image && (
        <Image source={{ uri: image.uri }} style={styles.image} />
      )}
      <Text style={styles.mascotText}>처방전 사진을 찍어볼까요?</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  mascot: {
    width: 120, height: 120, resizeMode: 'contain',
  },
  mascotBox: {
    alignItems: 'center', marginTop: 40,
  },
  mascotText: {
    marginTop: 10, fontSize: 25,
  },
  image: {
    width: 200, height: 200, marginTop: 20
  }
});

export default ImagePickerExample;
