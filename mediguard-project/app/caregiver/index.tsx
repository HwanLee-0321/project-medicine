import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Dashboard from './components/Dashboard';
import FunctionMain from './components/Functionmain';
import Calendar from './components/Calendar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Dashboard' | 'Function' | 'Calendar'>('Dashboard');

  return (
    <View style={{ flex: 1 }}>
      {/* 탭 메뉴 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, currentScreen === 'Dashboard' && styles.activeTab]}
          onPress={() => setCurrentScreen('Dashboard')}
        >
          <Text style={styles.tabText}></Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, currentScreen === 'Function' && styles.activeTab]}
          onPress={() => setCurrentScreen('Function')}
        >
          <Text style={styles.tabText}></Text>
        </TouchableOpacity>

        <TouchableOpacity
          
        >
          <Text style={styles.tabText}></Text>
        </TouchableOpacity>
      </View>

      {/* 선택된 화면 */}
      <View style={styles.screenContainer}>
        {currentScreen === 'Dashboard' && <Dashboard goToFunction={() => setCurrentScreen('Function')} />}
        {currentScreen === 'Function' && <FunctionMain goToDashboard={() => setCurrentScreen('Dashboard')} />}
        {currentScreen === 'Calendar' && <Calendar />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 50,
    flexDirection: 'row',
    backgroundColor: '#eee',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2a5dab',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
  },
});
