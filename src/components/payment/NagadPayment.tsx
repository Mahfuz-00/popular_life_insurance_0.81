import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { Alert, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { nagadPaymentUrl } from '../../actions/paymentServiceActions';
import { userPayPremium } from '../../actions/userActions';

type PaymentType = 'full' | 'partial';

type NagadPaymentProps = {
  amount: string;
  number: string;
  mobileNo: string;
  paymentType: PaymentType;
  partialAmount?: string;
  adjustWith?: string;
  cause?: string;
  policyDetails: any;
  onSuccess: (trxID: string) => void;
  onClose: () => void;
};

export const NagadPayment: React.FC<NagadPaymentProps> = ({
  amount,
  number,
  mobileNo,
  paymentType,
  partialAmount,
  adjustWith,
  cause,
  policyDetails,
  onSuccess,
  onClose,
}) => {
  const [url, setUrl] = useState<string>('');
  const trxNo = moment().format('YYYYMMDDHHmmss');

  useEffect(() => {
    const init = async () => {
      const postData = { policyNo: number, amount, mobileNo, transactionNo: trxNo };
      const paymentUrl = await nagadPaymentUrl(postData);
      if (paymentUrl) setUrl(paymentUrl);
      else Alert.alert('Error', 'Failed to start payment');
    };
    init();
  }, []);

  const handleSuccess = async () => {
    const postData: any = {
      policy_no: number,
      method: 'nagad',
      amount: paymentType === 'full' ? amount : null,
      transaction_no: trxNo,
      date_time: moment().format('DD-MM-YYYY HH:mm:ss'),
      partial_amount: paymentType === 'partial' ? partialAmount : null,
      adjust_with: paymentType === 'partial' ? adjustWith : null,
      cause: paymentType === 'partial' ? cause?.trim() : null,
      service_cell_code: policyDetails?.service_cell_code || '',
      branch_code: policyDetails?.branch_code || '',
    };

    const saved = JSON.parse((await AsyncStorage.getItem('syncPayments')) || '[]');
    await AsyncStorage.setItem('syncPayments', JSON.stringify([...saved, postData]));

    const lastId = await AsyncStorage.getItem('lastTransactionId');
    if (lastId === trxNo) {
      onClose();
      return;
    }

    await AsyncStorage.setItem('lastTransactionId', trxNo);

    const success = await userPayPremium(postData);
    if (success) {
      const updated = saved.filter((p: any) => p.transaction_no !== trxNo);
      await AsyncStorage.setItem('syncPayments', JSON.stringify(updated));
      onSuccess(trxNo);
    }
  };

  if (!url) return null;

  return (
    <WebView
      source={{ uri: url, method: 'post' }}
      style={{ flex: 1, marginTop: 20 }}
      onNavigationStateChange={(navState) => {
        const url = navState.url;

        if (url.includes('Success')) {
          handleSuccess();
          onClose();
        } else if (url.includes('Failed') || url.includes('Aborted')) {
          Alert.alert(
            'Payment Failed',
            url.includes('Aborted') ? 'You cancelled the payment' : 'Transaction failed'
          );
          onClose();
        }
      }}
    />
  );
};