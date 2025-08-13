import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@styles/colors';

type Option<T extends string> = { label: string; value: T };

export default function RadioGroup<T extends string>({
  label, value, options, onChange,
}: { label: string; value: T; options: Option<T>[]; onChange: (v: T) => void; }) {
  return (
    <View style={{ marginTop: 10, marginBottom: 6 }}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.row}>
        {options.map(o => (
          <TouchableOpacity key={o.value} style={styles.item} onPress={() => onChange(o.value)} activeOpacity={0.8}>
            <View style={[styles.circle, value === o.value && styles.selected]} />
            <Text style={styles.text}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: { color: colors.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.textPrimary, marginRight: 8, backgroundColor: 'transparent' },
  selected: { backgroundColor: colors.primary, borderColor: colors.textPrimary },
  text: { color: colors.textPrimary, fontSize: 16 },
});
