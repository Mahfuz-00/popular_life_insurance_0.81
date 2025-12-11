import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import globalStyle from '../styles/globalStyle';
import { PRIMARY_BUTTON_BG } from '../store/constants/colorConstants';

interface FilledButtonProps extends TouchableOpacityProps {
  title: string;
  style?: object;
}

export const FilledButton: React.FC<FilledButtonProps> = ({ title, style, ...props }) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: PRIMARY_BUTTON_BG }, style]}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={[globalStyle.font, styles.text]}>{title.toUpperCase()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});