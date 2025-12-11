import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import globalStyle from '../styles/globalStyle';

interface Item {
  label: string;
  value: string | number;
}

interface PickerComponentProps {
  items?: Item[];
  value: string | number;
  setValue: (value: any) => void;
  setLabel?: (label: string) => void;
  label?: string;
  placeholder?: string;
  errors?: Record<string, string>;
  errorField?: string;
  required?: boolean;
  style?: object;
  pickerProps?: any; // extra props for Picker
}

export const PickerComponent: React.FC<PickerComponentProps> = ({
  items = [],
  value,
  setValue,
  setLabel,
  label,
  placeholder = 'Select an option',
  errors = {},
  errorField = '',
  required = false,
  style,
  pickerProps = {},
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[globalStyle.font, styles.label]}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue, itemIndex) => {
            setValue(itemValue);
            if (setLabel) {
              // fallback for placeholder
              setLabel(itemValue === '' ? '' : items[itemIndex - 1]?.label || '');
            }
          }}
          style={styles.picker}
          {...pickerProps}
        >
          <Picker.Item label={placeholder} value="" />
          {items.map((item, index) => (
            <Picker.Item
              key={index}
              label={item.label}
              value={item.value}
              style={globalStyle.font}
            />
          ))}
        </Picker>
      </View>
      {errors[errorField] && (
        <Text style={globalStyle.errorMessageText}>{errors[errorField]}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { marginBottom: 4 },
  required: { color: 'red' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff', // like old project
  },
  picker: { height: 50 },
});
