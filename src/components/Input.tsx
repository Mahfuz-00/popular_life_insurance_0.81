import React from 'react';
import { StyleSheet, TextInput, View, Text, TextInputProps } from 'react-native';
import globalStyle from '../styles/globalStyle';

interface InputProps extends TextInputProps {
  label?: string;
  labelStyle?: object;
  errors?: Record<string, string>;
  errorField?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  labelStyle,
  errors = {},
  errorField = '',
  required = false,
  style,
  editable = true,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[globalStyle.font, styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TextInput
        style={[
          globalStyle.font,
          styles.input,
          style,
          { backgroundColor: !editable ? '#e0e0e0' : '#fff' },
        ]}
        placeholderTextColor="#999"
        editable={editable}
        {...props}
      />
      {errors[errorField] && (
        <Text style={globalStyle.errorMessageText}>{errors[errorField]}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { fontSize: 15, marginBottom: 4 },
  required: { color: 'red' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
});