import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { Alert, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { nagadPaymentUrl } from '../../actions/paymentServiceActions';
import { userPayPremium, userPayPremiumUpdate } from '../../actions/userActions';

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
  secondaryPaymentId?: number | null;
};

const getQueryParam = (url: string, key: string) => {
  const params = url.split('?')[1];
  if (!params) return null;
  const search = new URLSearchParams(params);
  return search.get(key);
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
  secondaryPaymentId,
}) => {
  const [url, setUrl] = useState<string>('');
  const trxNoRef = React.useRef(moment().format('YYYYMMDDHHmmss'));
  const trxNo = trxNoRef.current;

  useEffect(() => {
    const init = async () => {
      const postData = { policyNo: number, amount, mobileNo, transactionNo: trxNo };
      const paymentUrl = await nagadPaymentUrl(postData);
      if (paymentUrl) setUrl(paymentUrl);
      else Alert.alert('Error', 'Failed to start payment');
    };
    init();
  }, []);

  const handleSuccess = async (realTrxId: string) => {
    const partialFields = paymentType === 'partial' ? {
      partial_amount: partialAmount,
      adjust_with: adjustWith,
      cause: cause?.trim(),
    } : {};

    /* ---------------- SECONDARY UPDATE (FIRST & ALWAYS) ---------------- */
    const updatePostData = {
      policy_no: number,
      method: 'nagad',
      amount: paymentType === 'full' ? amount : partialAmount,
      transaction_no: realTrxId,
      date_time: trxNo,
      id: secondaryPaymentId,
    };
    const successUpdate = await userPayPremiumUpdate(updatePostData);
    if (successUpdate) {
      console.log('Secondary server updated');
    } else {
      console.warn('Secondary update failed — should be retried later');
    }

    /* ---------------- PRIMARY PAYLOAD ---------------- */
    const postData: any = {
      policy_no: number,
      method: 'nagad',
      // If full payment, use the amount prop, otherwise nullify the main amount field.
      amount: paymentType === 'full' ? amount : null,
      transaction_no: realTrxId,
      date_time: trxNo,

      //SPREAD THE PARTIAL FIELDS: Only exists if paymentType is 'partial'
      ...partialFields,

      service_cell_code: policyDetails?.service_cell_code || '',
      branch_code: policyDetails?.branch_code || '',
    };

    console.log('NAGAD PAYMENT POST DATA:', postData);

    const saved = JSON.parse((await AsyncStorage.getItem('syncPayments')) || '[]');
    await AsyncStorage.setItem('syncPayments', JSON.stringify([...saved, postData]));

    const lastId = await AsyncStorage.getItem('lastTransactionId');
    if (lastId === realTrxId) {
      onClose();
      return;
    }

    await AsyncStorage.setItem('lastTransactionId', realTrxId);

    const success = await userPayPremium(postData);
    if (success) {
      const updated = saved.filter((p: any) => p.transaction_no !== realTrxId);
      await AsyncStorage.setItem('syncPayments', JSON.stringify(updated));
      onSuccess(realTrxId);
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
          console.log("NAGAD RETURNED SUCCESS — FULL RESPONSE BODY BELOW:");
          console.log("URL:", url);
          console.log("Full navState:", JSON.stringify(navState, null, 2));
          const issuerTrx = getQueryParam(url, 'issuer_payment_ref');

          if (!issuerTrx) {
            Alert.alert('Error', 'Transaction ID missing from Nagad response');
            onClose();
            return;
          }

          console.log('Nagad trxID:', issuerTrx);

          handleSuccess(issuerTrx);
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