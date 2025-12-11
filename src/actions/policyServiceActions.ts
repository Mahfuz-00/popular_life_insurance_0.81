import axios from 'axios';
import { API } from './../config';
import { ToastAndroid } from 'react-native'
import { HIDE_LOADING, SHOW_LOADING } from './../store/constants/commonConstants';

export const updatePolicyMobile = async (postData: any) => {
  try {
    const { data } = await axios.post(`${API}/api/update/policy/mobile`, postData);
    ToastAndroid.show(data.message || 'Success', ToastAndroid.LONG);
  } catch (error: any) {
    ToastAndroid.show(error.response?.data?.message || 'Failed', ToastAndroid.LONG);
  }
};

export const getPolicyDetails = (postData: any) => async (dispatch: any) => {
  try {
    dispatch({ type: SHOW_LOADING });
    const { data } = await axios.post(`${API}/api/policy-details`, postData);
    dispatch({ type: HIDE_LOADING });
    return data;
  } catch (error: any) {
    dispatch({ type: HIDE_LOADING });
    ToastAndroid.show(error.response?.data?.message || 'Network error', ToastAndroid.LONG);
    return null;
  }
};