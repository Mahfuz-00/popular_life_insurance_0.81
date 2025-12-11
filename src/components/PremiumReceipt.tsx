import React from 'react';
import { Alert, Linking } from 'react-native';
import { API } from '../config';

export const showPartialReceiptAlert = (trxNo: string): void => {
  Alert.alert(
    'Receipt Available',
    'Partial payment completed. Would you like to download the receipt?',
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Download',
        onPress: () => {
          const url = `${API}8/api/policy/short-pr-receipt/${trxNo}`;
          Linking.openURL(url);
        },
      },
    ]
  );
};