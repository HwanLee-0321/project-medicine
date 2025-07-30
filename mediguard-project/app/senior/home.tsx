// screens/Home.tsx

import React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

// 하위 컴포넌트들
import NextMedication from '../components/NextMedication';
import CurrentTime from '../components/CurrentTime';
// import Mascot from '../components/Mascot';
import VoiceGuide from '../components/VoiceGuide';
import OCRCapture from '../components/OCRCapture';
import ReminderHandler from '../components/ReminderHandler';
// import SettingsShortcut from '../components/SettingsShortcut';

const Home = () => {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* 현재 시간 표시 */}
                <CurrentTime />

                {/* 마스코트 캐릭터 (추후 애니메이션 포함) 만들기 싫음 */}
                {/* <Mascot /> */}

                {/* 다음 복약 시간 안내 */}
                <NextMedication />

                {/* 복약 알림 수신 → 안내 흐름 */}
                <ReminderHandler />

                {/* OCR 약봉지 촬영 유도 버튼 */}
                <OCRCapture />

                {/* 음성 안내 및 건강 상태 대화 */}
                <VoiceGuide />

                {/* 설정 화면 바로가기 (글씨, 음성, 식사시간 등) */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#9E9E9E', marginTop: 20 }]}
                    onPress={() => router.push('/components/SettingsShortcut')}
                >
                    <Text style={styles.buttonText}>⚙️설정 화면으로</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 30, // 원하는 만큼 조정
    },
    container: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
        gap: 30,
    },
    button: {
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginTop: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});

export default Home;
