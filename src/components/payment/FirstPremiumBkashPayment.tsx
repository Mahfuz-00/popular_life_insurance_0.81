import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  bkashGetToken,
  bkashCreatePayment,
  bkashExecutePayment,
} from '../../actions/paymentServiceActions';
import { userPayPremium, userPayFirstPremium } from '../../actions/userActions';
import { downloadFirstPremiumReceipt } from '../../actions/userActions';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants';

type FirstPremiumBkashProps = {
  amount: string;
  nid: string;
  proposalData: any;
  onSuccess: () => void;
  onClose: () => void;
  navigation: any;
};

export const FirstPremiumBkashPayment: React.FC<FirstPremiumBkashProps> = ({
  amount,
  nid,
  proposalData,
  onSuccess,
  onClose,
  navigation,
}) => {
  const dispatch = useDispatch();

  const [bkashUrl, setBkashUrl] = useState<string>('');
  const [bkashToken, setBkashToken] = useState<string>('');
  const [bkashPaymentId, setBkashPaymentId] = useState<string>('');

  const startPayment = async () => {
    try {
      let token = await AsyncStorage.getItem('bkashToken');
      if (!token) {
        const res = await bkashGetToken();
        token = res.id_token;
        await AsyncStorage.setItem('bkashToken', token!);
        setTimeout(() => AsyncStorage.removeItem('bkashToken'), 55 * 60 * 1000);
      }

      const result = await bkashCreatePayment(token!, amount, nid);
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
    try {
      // Immediately pop back for instant UX feedback
      navigation.pop();

      // Show loading while processing both APIs
      dispatch({ type: SHOW_LOADING, payload: 'Completing your payment...' });

      // Step 1: Record payment via userPayPremium (minimal data)
      const paymentPostData = {
        project_name: proposalData.project,
        policy_no: proposalData.nid,
        method: 'bkash',
        amount: amount,
        transaction_no: trxID,
        date_time: moment().format('DD-MM-YYYY HH:mm:ss'),
      };

      const paymentResult = await userPayPremium(paymentPostData);

      if (!paymentResult?.data?.data?.id) {
        dispatch({ type: HIDE_LOADING });
        Alert.alert(
          'Processing Error',
          'Payment succeeded at bKash but no confirmation ID received.\n\nPlease contact support with TrxID: ' + trxID
        );
        return;
      }

      // Step 2: Submit full first premium with payment_id
      const fullPostData = {
        payment_id: paymentResult.data.data.id,
        ...proposalData,
      };

      const firstPremiumResult = await userPayFirstPremium(fullPostData);

      dispatch({ type: HIDE_LOADING });

      if (firstPremiumResult.success) {
        Alert.alert(
          'Payment Successful!',
          'Your first premium has been processed.\n\nDownload your e-Receipt below.',
          [
            {
              text: 'Download Receipt',
              onPress: () => downloadFirstPremiumReceipt(nid, trxID),
            },
            {
              text: 'Done',
              onPress: onSuccess,
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Processing Error',
          'Payment succeeded at bKash but final processing failed.\n\nPlease contact support with TrxID: ' + trxID
        );
      }
    } catch (err: any) {
      dispatch({ type: HIDE_LOADING });
      Alert.alert('Error', 'Something went wrong during processing. Please contact support.');
      console.error('Bkash first premium error:', err);
    }
  };

  if (!bkashUrl) return null;

  return (
    <WebView
      source={{ uri: bkashUrl }}
      style={{ flex: 1, marginTop: 20 }}
      onNavigationStateChange={async (navState) => {
        if (navState.url.includes('status=success')) {
          setBkashUrl('');

          try {
            const executeResult = await bkashExecutePayment(bkashToken, bkashPaymentId);

            if (executeResult.transactionStatus === 'Completed') {
              await handleSuccess(executeResult.trxID);
            } else {
              dispatch({ type: HIDE_LOADING });
              Alert.alert('Payment Failed', executeResult.statusMessage || 'Transaction failed');
              onClose();
            }
          } catch (error) {
            dispatch({ type: HIDE_LOADING });
            Alert.alert('Error', 'Failed to verify payment. Please contact support.');
            onClose();
          }
        } else if (navState.url.includes('status=failure') || navState.url.includes('cancel')) {
          navigation.pop();
          Alert.alert('Payment Cancelled', 'Transaction was cancelled.');
          onClose();
        }
      }}
    />
  );
};