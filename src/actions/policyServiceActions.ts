import axios from 'axios';
import { API } from './../config';
import { ToastAndroid, Platform, Alert } from 'react-native'
import { HIDE_LOADING, SHOW_LOADING } from './../store/constants/commonConstants';

export const updatePolicyMobile = async (postData: any) => {
  try {
    const { data } = await axios.post(`${API}/api/update/policy/mobile`, postData);
    if (Platform.OS === 'android') {
      ToastAndroid.show(data.message || 'Success', ToastAndroid.LONG);
    } else {
      Alert.alert('Success', data.message || 'Policy mobile number updated successfully!');
    }
    return {
      isSuccess: true,
      message: data.message || 'Policy mobile number updated successfully!'
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to update phone number due to a network error.';
    // ToastAndroid.show(errorMessage, ToastAndroid.LONG); // Removed toast here to let the screen handle it with Alert

    // Check for validation errors if structure is consistent
    const errors = error.response?.data?.errors;

    return {
      isSuccess: false,
      message: errorMessage,
      errors: errors
    };
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
    if (Platform.OS === 'android') {
      ToastAndroid.show(error.response?.data?.message || 'Network error', ToastAndroid.LONG);
    } else {
      Alert.alert('Error', error.response?.data?.message || 'Network error occurred while fetching policy details.');
    }
    return null;
  }
};