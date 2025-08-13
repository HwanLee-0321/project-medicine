import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@styles/colors';

export default function TextLink({ title, onPress }: { title: string; onPress: () => void; }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.link}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  link: { marginTop: 18, color: colors.primary, textAlign: 'center', fontWeight: '700', fontSize: 16 },
});
