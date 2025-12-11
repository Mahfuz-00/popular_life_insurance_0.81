import axios from 'axios';
import { API } from './../config';
import { ToastAndroid } from 'react-native';

export const getPlanList = async () => {
  try {
    const { data } = await axios.get(`${API}/api/plans`);
    const res = data.data.map((item: any) => ({
      label: item.name,
      value: item.code,
      fullLabel: item.name,
      modes: {
        yly: item.yly === '1' ? { label: 'Yearly', value: 'yly' } : null,
      hly: item.hly === '1' ? { label: 'Half Yearly', value: 'hly' } : null,
      qly: item.qly === '1' ? { label: 'Quarterly', value: 'qly' } : null,
      mly: item.mly === '1' ? { label: 'Monthly', value: 'mly' } : null,
      single: item.single === '1' ? { label: 'Single', value: 'single' } : null,
    }}));
    return res;
  } catch (error) {
    return [];
  }
};

export const getTermList = async (code: any) => {
  try {
    const { data } = await axios.get(`${API}/api/plan-to-tarm/${code}`);
    const res = data.data.tarms.map((item: any) => ({ label: item, value: item }));
    return res;
  } catch (error) {
    return [];
  }
};

export const getCalculatedPremium = async (postData: any) => {
  console.log('Calculator Data:', JSON.stringify(postData, null, 2));
  try {
    const { data } = await axios.post(`${API}/api/premium-calculator`, postData);
    return data.data.result;
  } catch (error: any) {
    ToastAndroid.show(error.response?.data?.message || error.message || 'Premium calculation failed', ToastAndroid.LONG);
    return ; 
  }
};