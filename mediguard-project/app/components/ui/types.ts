import { GestureResponderEvent, StyleProp, ViewStyle, TextStyle } from 'react-native';

export type ButtonProps = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  testID?: string;
};

export type InputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  errorText?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  testID?: string;
};

export type PasswordInputProps = InputProps & {
  secureDefault?: boolean; // 기본 true 추천
};

export type RadioOption = { label: string; value: string };
export type RadioGroupProps = {
  value: string;
  onChange: (val: string) => void;
  options: RadioOption[];
  horizontal?: boolean;
  testID?: string;
};
