import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { Alert, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {
  bkashGetToken,
  bkashCreatePayment,
  bkashExecutePayment,
} from '../../actions/paymentServiceActions';
import { userPayPremium } from '../../actions/userActions';

type PaymentType = 'full' | 'partial';

type BkashPaymentProps = {
  amount: string;
  number: string;
  paymentType: PaymentType;
  partialAmount?: string;
  adjustWith?: string;
  cause?: string;
  policyDetails: any;
  onSuccess: (trxID: string) => void;
  onClose: () => void;
};

export const BkashPayment: React.FC<BkashPaymentProps> = ({
  amount,
  number,
  paymentType,
  partialAmount,
  adjustWith,
  cause,
  policyDetails,
  onSuccess,
  onClose,
}) => {
  const [bkashUrl, setBkashUrl] = useState<string>('');
  const [bkashToken, setBkashToken] = useState<string>('');
  const [bkashPaymentId, setBkashPaymentId] = useState<string>('');

  const startPayment = async () => {
    try {
      let token = await AsyncStorage.getItem('bkashToken');
      let isFirst = !token;

      if (!token) {
        const res = await bkashGetToken();
        token = res.id_token;
        await AsyncStorage.setItem('bkashToken', token!);
        setTimeout(() => AsyncStorage.removeItem('bkashToken'), 55 * 60 * 1000);
      }

      const result = await bkashCreatePayment(token!, amount, number);
      if (result?.message?.includes('expired')) {
        await AsyncStorage.removeItem('bkashToken');
        Alert.alert('Session Expired', 'Please try again.');
        onClose();
        return;
      }

      setBkashToken(token!);
      setBkashPaymentId(result.paymentID);
      setBkashUrl(result.bkashURL);
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Network error');
      onClose();
    }
  };

  useEffect(() => {
    startPayment();
  }, []);

  const handleSuccess = async (trxID: string) => {
    const partialFields = paymentType === 'partial' ? {
      partial_amount: partialAmount, 
      adjust_with: adjustWith,
      cause: cause?.trim(),
    } : {};


    const postData: any = {
      policy_no: number,
      method: 'bkash',
      // If full payment, use the amount prop, otherwise nullify the main amount field.
      amount: paymentType === 'full' ? amount : null, 
      transaction_no: trxID,
      date_time: moment().format('DD-MM-YYYY HH:mm:ss'),
      
      //SPREAD THE PARTIAL FIELDS: Only exists if paymentType is 'partial'
      ...partialFields,

      service_cell_code: policyDetails?.service_cell_code || '',
      branch_code: policyDetails?.branch_code || '',
    };
    
    console.log('BKASH PAYMENT POST DATA:', postData);

    const saved = JSON.parse((await AsyncStorage.getItem('syncPayments')) || '[]');
    await AsyncStorage.setItem('syncPayments', JSON.stringify([...saved, postData]));

    const success = await userPayPremium(postData);
    if (success) {
      const updated = saved.filter((p: any) => p.transaction_no !== trxID);
      await AsyncStorage.setItem('syncPayments', JSON.stringify(updated));
      onSuccess(trxID);
    } else {
      ToastAndroid.show('Payment recorded. Will sync when online.', ToastAndroid.LONG);
    }
  };

  if (!bkashUrl) return null;

  return (
    <WebView
      source={{ uri: bkashUrl }}
      style={{ flex: 1, marginTop: 20 }}
      onNavigationStateChange={async (navState) => {
        const url = navState.url;

        if (url.includes('status=success')) {
          setBkashUrl('');
          const result = await bkashExecutePayment(bkashToken, bkashPaymentId);

          if (result.transactionStatus === 'Completed') {
            await handleSuccess(result.trxID);
          } else {
            Alert.alert('Payment Failed', result.statusMessage || 'Transaction failed');
            onClose();
          }
        } else if (url.includes('status=failure') || url.includes('cancel')) {
          Alert.alert('Payment Cancelled', 'Transaction was cancelled.');
          onClose();
        }
      }}
    />
  );
};