import React from 'react';
import { SafeAreaView, View, StyleSheet, Platform, StatusBar } from 'react-native';
import FunctionMain from './components/Dashboard';

const TOP_OFFSET = Platform.select({
  ios: 20,                                    // iOS 살짝 아래
  android: (StatusBar.currentHeight ?? 0) + 8 // Android 상태바 + 여유
});

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, { paddingTop: TOP_OFFSET }]}>
        <FunctionMain />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
});
