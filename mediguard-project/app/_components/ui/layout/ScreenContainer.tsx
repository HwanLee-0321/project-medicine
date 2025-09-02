// app\_components\ui\layout\ScreenContainer.tsx

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { colors } from '@styles/colors';

export default function ScreenContainer({
  children,
  keyboardOffset = Platform.select({ ios: 48, android: 0 }) as number,
}: {
  children: React.ReactNode;
  keyboardOffset?: number;
}) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardOffset}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        // 비의도치 스크롤/포커스 튀는 현상 방지
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
});
