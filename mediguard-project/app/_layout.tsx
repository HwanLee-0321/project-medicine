// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
/*
// ⬇️ API 베이스(URL) 초기화(ngrok/LAN/auto 복구)
import { initApiBaseFromStorage } from './_utils/api';

// ⬇️ 푸시 알림 초기화(권한 요청, 토큰 발급/등록, 리스너 세팅)
import { initPushNotifications } from './_utils/push';
*/
export default function Layout() {
  /*
  useEffect(() => {
    // 앱 시작 시 저장된 서버 주소/모드 복구
    initApiBaseFromStorage();

    // 푸시 알림 초기화(클린업 반영)
    let cleanup: undefined | (() => void);
    (async () => {
      cleanup = await initPushNotifications();
    })();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);
*/
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {/* 전역 Toast UI */}
      <Toast />
    </>
  );
}
