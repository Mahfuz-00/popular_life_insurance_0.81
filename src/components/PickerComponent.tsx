import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
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
  disabled?: boolean;
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
  disabled = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[globalStyle.font, styles.label]}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <Dropdown
        style={[globalStyle.inputWrapper, styles.dropdown, disabled && styles.dropdownDisabled]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        data={items}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={(item) => {
          setValue(item.value);
          if (setLabel) setLabel(item.label);
        }}
        disable={disabled}
      />

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

  dropdown: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  dropdownDisabled: {
    backgroundColor: '#e0e0e0',
  },

  placeholderStyle: {
    color: '#444',
    fontSize: 16,
  },

  selectedTextStyle: {
    color: '#000',
    fontSize: 16,
  },

  itemTextStyle: {
    color: '#000',
    fontSize: 16,
  },
});
