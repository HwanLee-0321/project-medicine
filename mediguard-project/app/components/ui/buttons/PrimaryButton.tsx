// components/ui/buttons/PrimaryButton.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ButtonProps } from '../types';
import { colors } from '@styles/colors';

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  testID,
}: ButtonProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[s.btn, disabled && s.disabled, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {leftIcon}
      {loading ? <ActivityIndicator /> : <Text style={[s.txt, textStyle]}>{title}</Text>}
      {rightIcon}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
  txt: { color: colors.onPrimary, fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.5 },
});
