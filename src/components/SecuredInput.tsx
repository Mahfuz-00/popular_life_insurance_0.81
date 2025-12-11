import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface SecuredInputProps extends TextInputProps {
  label?: string;
  errors?: Record<string, string>;
  errorField?: string;
}

export const SecuredInput: React.FC<SecuredInputProps> = ({
  label,
  errors = {},
  errorField = '',
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          {...props}
          secureTextEntry={!showPassword}
          style={[styles.input, style]}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
          <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#666" />
        </TouchableOpacity>
      </View>
      {errors[errorField] && <Text style={styles.error}>{errors[errorField]}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { fontSize: 15, marginBottom: 4, color: '#333' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  eye: { paddingHorizontal: 12 },
  error: { color: 'red', fontSize: 13, marginTop: 4 },
});