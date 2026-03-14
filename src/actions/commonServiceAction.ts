import axios from 'axios';
import { API } from './../config';
import { ToastAndroid, Platform, Alert } from 'react-native';

export const getPolicyDetails = async (policyNo: any) => {
  try {
    const { data } = await axios.get(`${API}/api/policy-details/${policyNo}`);
    return data.data;
  } catch (error) {
    return [];
  }
};

export const getClaimTypes = async () => {
  try {
    const { data } = await axios.get(`${API}/api/claims/types`);
    return data.data;
  } catch (error) {
    return [];
  }
};

export const getOfficeInfo = async (type: any) => {
  try {
    const { data } = await axios.get(
      type === 'corporate'
        ? `${API}/api/corporate-office`
        : `${API}/api/divisional-office`
    );
    return data.data;
  } catch (error) {
    return [];
  }
};

export const guestPayPremium = async (postData: any) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    const { data } = await axios.post(`${API}/api/payment-without-auth`, postData, config);

    if (Platform.OS === 'android') {
      ToastAndroid.show(data.message || 'Payment successful', ToastAndroid.LONG);
    } else {
      Alert.alert('Success', data.message || 'Payment successful');
    }
    return true;
  } catch (error: any) {
    if (Platform.OS === 'android') {
      ToastAndroid.show('Failed to pay. Try again..', ToastAndroid.LONG);
    }
    else {
      Alert.alert('Error', 'Failed to pay. Try again..');
    }
    return false;
  }
};