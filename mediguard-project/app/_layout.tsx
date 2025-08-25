// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function Layout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {/* 전역 Toast UI */}
      <Toast />
    </>
  );
}
