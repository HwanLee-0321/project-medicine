import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Dashboard from './components/Dashboard';
import FunctionMain from './components/Functionmain';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Dashboard' | 'Function'>('Dashboard');

  return (
    <View style={styles.container}>
      {currentScreen === 'Dashboard' ? (
        <Dashboard goToFunction={() => setCurrentScreen('Function')} />
      ) : (
        <FunctionMain goToDashboard={() => setCurrentScreen('Dashboard')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});
