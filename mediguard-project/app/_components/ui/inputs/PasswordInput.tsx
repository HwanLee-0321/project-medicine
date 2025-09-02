import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { colors } from '@styles/colors';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: object;
  // ✅ useRef(null)도 안전하게 받도록 React.Ref 로 변경
  inputRef?: React.Ref<TextInput>;
};

export default function PasswordInput({
  label,
  error,
  style,
  containerStyle,
  inputRef,
  secureTextEntry = true,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={inputRef}
        style={[styles.input, focused && styles.focused, style]}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        {...rest}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { marginBottom: 6, color: colors.textPrimary, fontWeight: '700' },
  input: {
    borderWidth: 2, borderColor: colors.textPrimary, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16, backgroundColor: colors.white,
    color: colors.textPrimary, fontSize: 16,
  },
  focused: {
    borderColor: colors.primary,
    shadowColor: colors.primary, shadowOpacity: 0.12, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  error: { marginTop: 6, color: '#C62828', fontSize: 13, fontWeight: '600' },
});
