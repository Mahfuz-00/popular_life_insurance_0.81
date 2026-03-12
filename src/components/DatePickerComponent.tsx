import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import globalStyle from '../styles/globalStyle';

let DatePickerAndroid: any = null;
if (Platform.OS === 'android') {
  // Only import react-native-date-picker on Android
  DatePickerAndroid = require('react-native-date-picker').default;
}

interface DatePickerComponentProps {
  date?: Date | null;
  setDate: (date: Date) => void;
  label?: string;
  labelStyle?: object;
  style?: object;
  defaultDate?: Date;
  editable?: boolean;
  required?: boolean;
}

export const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  date,
  setDate,
  label,
  labelStyle,
  style,
  defaultDate = new Date('1990-01-01'),
  editable = true,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handlePress = () => {
    if (!editable) return;
    setOpen(true);
  };

  const handleConfirmIOS = (_event: any, selectedDate?: Date) => {
    setOpen(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[globalStyle.font, labelStyle]}>{label}</Text>}
      <TouchableOpacity onPress={handlePress} disabled={!editable}>
        <TextInput
          style={[
            globalStyle.font,
            styles.input,
            { backgroundColor: !editable ? '#b2b2b2' : '#FFF' },
          ]}
          value={date ? moment(date).format('YYYY-MM-DD') : ''}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {Platform.OS === 'android' && DatePickerAndroid && (
        <DatePickerAndroid
          modal
          open={open}
          date={date || defaultDate}
          mode="date"
          onConfirm={(selectedDate: Date) => {
            setOpen(false);
            setDate(selectedDate);
          }}
          onCancel={() => setOpen(false)}
        />
      )}

      {Platform.OS === 'ios' && open && (
        <DateTimePicker
          value={date || defaultDate}
          mode="date"
          display="default"
          onChange={handleConfirmIOS}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
});