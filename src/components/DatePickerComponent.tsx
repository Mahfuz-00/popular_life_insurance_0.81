import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import globalStyle from '../styles/globalStyle';

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

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[globalStyle.font, labelStyle]}>{label}</Text>}
      <TouchableOpacity
        onPress={() => editable && setOpen(true)}
        disabled={!editable}
      >
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
      <DatePicker
        modal
        open={open}
        date={date || defaultDate}
        mode="date"
        onConfirm={(selectedDate) => {
          setOpen(false);
          setDate(selectedDate);
        }}
        onCancel={() => setOpen(false)}
      />
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