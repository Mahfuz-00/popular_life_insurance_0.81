import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import globalStyle from '../../styles/globalStyle';

interface EnglishOnlyInputProps extends TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;           
  placeholder?: string;
  errors?: any;           
  errorField?: string;
}

const EnglishOnlyInput: React.FC<EnglishOnlyInputProps> = ({ label, value, onChangeText, required = false, placeholder, errors, errorField, ...rest }) => {
  const handleChange = (text: string) => {
    // Allow only English letters, numbers, spaces, and basic punctuation
    const cleaned = text.replace(/[^a-zA-Z0-9 .,!?@#&*()_+-=]/g, '');
    onChangeText(cleaned);
  };

  const hasError = errors && errorField && errors[errorField];

  return (
    <View style={styles.container}>
       {label && (
        <Text style={[globalStyle.fontMedium, styles.label]}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TextInput
        {...rest}
        value={value}
        onChangeText={handleChange}
        style={[
          styles.input,
          globalStyle.inputWrapper,
          rest.style,
          hasError && { borderColor: 'red' }, 
        ]}
        autoCorrect={false}
        spellCheck={false}
        keyboardType="ascii-capable"
        placeholderTextColor="#999"
      />

      {/* Error Message */}
      {hasError && (
        <Text style={styles.errorText}>{errors[errorField]}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  required: { color: 'red' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000',
  },
   errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 13,
  },
});

export default EnglishOnlyInput;