// app/dev/push-test.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { fireLocalNotificationNow } from '@app/_utils/push';
import { colors } from '@styles/colors';

export default function PushTestScreen() {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => fireLocalNotificationNow('테스트', '로컬 알림 OK?')}
        style={styles.btn}
      >
        <Text style={styles.txt}>로컬 알림 테스트</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: colors.background },
  btn: { height: 52, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  txt: { color: colors.onPrimary, fontWeight: '700' },
});
