import axios from 'axios';
import { API } from './../config';
import { ToastAndroid } from 'react-native';

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

    ToastAndroid.show(data.message || 'Payment successful', ToastAndroid.LONG);
    return true;
  } catch (error: any) {
    ToastAndroid.show('Failed to pay. Try again..', ToastAndroid.LONG);
    return false;
  }
};