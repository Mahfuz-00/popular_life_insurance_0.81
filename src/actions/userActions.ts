import { Alert, ToastAndroid, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../utils/axios';
import { API, SECONDARYAPI } from '../config';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_FAIL,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOAD_USER_FAIL,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  UPDATE_PASSWORD_REQUEST,
  UPDATE_PASSWORD_SUCCESS,
  UPDATE_PASSWORD_FAIL,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAIL,
  NEW_PASSWORD_REQUEST,
  NEW_PASSWORD_SUCCESS,
  NEW_PASSWORD_FAIL,
  LOGOUT_SUCCESS,
  LOGOUT_FAIL,
  CLEAR_ERRORS,
} from '../store/constants/userConstants';
import { SHOW_LOADING, HIDE_LOADING } from '../store/constants/commonConstants';
import { rootNavigationRef } from '../../App';

// Helper to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${JSON.parse(token)}` : '',
  };
};

// ──────────────────────────────────────────────────────────────
// APP HEALTH CHECK — DB CONNECTION BEFORE PAYMENT
// ──────────────────────────────────────────────────────────────
export const checkDatabaseConnection = async (): Promise<boolean> => {
  console.log('🔍 [Health Check] Checking database connection...');

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await axios.get(`${API}/api/check-db-conn`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;

    console.log(`✅ [Health Check] Response received in ${duration}ms`);
    console.log('Response data:', response.data);
    console.log('HTTP Status:', response.status);

    // The real truth is in response.data.error
    const isConnected = response.data?.error === false;

    if (isConnected) {
      console.log('🎉 Database connection: OK');
    } else {
      console.log('❌ Database connection: FAILED (error: true)');
      ToastAndroid.show('Server database issue. Please try again later.', ToastAndroid.LONG);
    }

    return isConnected;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    if (error.name === 'AbortError') {
      console.log(`⏰ [Health Check] Timeout after 30s`);
      ToastAndroid.show('Server timeout. Please check your connection.', ToastAndroid.LONG);
    } else {
      console.log(`🌐 [Health Check] Network/request error in ${duration}ms:`, error.message);
      ToastAndroid.show('Cannot reach server. Please try again later.', ToastAndroid.LONG);
    }

    return false;
  }
};


// ──────────────────────────────────────────────────────────────
// 1. PAYMENT & POLICY ACTIONS (USED HEAVILY)
// ──────────────────────────────────────────────────────────────
export const userPayPremium = async (postData: any): Promise<{ data: any; success: boolean }> => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(`${API}/api/payment`, postData, { headers });

    ToastAndroid.show(data.message || 'Payment successful', ToastAndroid.LONG);

    return { data, success: true };
  } catch (error: any) {
    ToastAndroid.show('Payment failed. Try again.', ToastAndroid.LONG);
    console.error('userPayPremium error:', error.response?.data || error.message);
    return { data: null, success: false };
  }
};

export const createClaim = async (postData: any) => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(`${API}/api/claims/create`, postData, { headers });

    if (data.errors) {
      ToastAndroid.show(data.message || 'Claim submission failed', ToastAndroid.LONG);
      return { isSuccess: false, errors: data.errors };
    }

    ToastAndroid.show('Claim submitted successfully', ToastAndroid.LONG);
    return { isSuccess: true };
  } catch (error: any) {
    ToastAndroid.show(error.message || 'Network error', ToastAndroid.LONG);
    return { isSuccess: false };
  }
};

export const getDuePremiumDetails = async (policyNo: string) => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(`${API}/api/policy-due-premium`, { policyNo }, { headers });
    return data.data || [];
  } catch (error) {
    return [];
  }
};

export const getPolicyListByUser = async () => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(`${API}/api/policy-list/auth`, {}, { headers });
    console.log('Policy List:', data);
    return data.data || [];
  } catch (error) {
    return [];
  }
};

export const getPolicyDetailsByUser = async (policyNo: string) => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.get(`${API}/api/policy-details/${policyNo}`, { headers });
    return data.data || [];
  } catch (error) {
    return [];
  }
};

export const getAuthPolicyDetails = (postData: any) => async (dispatch: any) => {
  try {
    dispatch({ type: SHOW_LOADING });
    const headers = await getAuthHeaders();
    const { data } = await axios.post(`${API}/api/policy-details/auth`, postData, { headers });
    dispatch({ type: HIDE_LOADING });
    return data;
  } catch (error: any) {
    dispatch({ type: HIDE_LOADING });
    ToastAndroid.show(error.message || 'Failed to fetch policy', ToastAndroid.LONG);
    return null;
  }
};

export const getPrListByUser = (policyNo: string) => async (dispatch: any) => {
  try {
    dispatch({ type: SHOW_LOADING });
    const headers = await getAuthHeaders();

    const { data } = await axios.post(
      `${API}/api/policy-pr-list-year-wise/${policyNo}`,
      {},
      { headers }
    );

    dispatch({ type: HIDE_LOADING });
    return data.data || [];
  } catch (error) {
    dispatch({ type: HIDE_LOADING });
    return [];
  }
};

export const userPolicyPaymentList = async (postData: any) => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await axios.post(
      `${API}/api/policy/payments`,
      postData,
      { headers },
    );

    return data;
  } catch (error) {
    return;
  }
};


export const userPolicyPartialPaymentList = async (postData: any) => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await axios.post(
      `${API}/api/policy/partial-payment`,
      postData,
      { headers },
    );

    return data;
  } catch (error) {
    return;
  }
};


export const userPayFirstPremium = async (postData: any): Promise<{ success: boolean; message?: string }> => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(`${API}/api/first-premium`, postData, { headers });

    if (data.errors) {
      ToastAndroid.show(data.message || 'Payment failed', ToastAndroid.LONG);
      return { success: false, message: data.message };
    }

    ToastAndroid.show(data.message || 'Payment successful', ToastAndroid.LONG);
    return { success: true, message: data.message };
  } catch (error: any) {
    ToastAndroid.show(error.message || 'Payment failed', ToastAndroid.LONG);
    console.error('userPayFirstPremium error:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};

export const downloadFirstPremiumReceipt = (nid: string, trxID: string) => {
  const url = `${API}/api/first-payment/e-receipt/${nid}/${trxID}`;
  Linking.openURL(url).catch(() => {
    ToastAndroid.show('Cannot open eReceipt', ToastAndroid.LONG);
  });
};

export const fetchFirstPremiumTransactions = async (nid: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${API}/api/first-payment/transactions/${nid}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JSON.parse(token!)}`,
      },
    });

    if (response.status === 200 && response.data?.data) {
      return { success: true, data: response.data.data };
    }

    return { success: false, data: [] };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message || 'Server error' };
  }
};

// ──────────────────────────────────────────────────────────────
// SECONDARY SERVER PAYMENT ACTIONS
// ──────────────────────────────────────────────────────────────
export const userPayPremiumSave = async (postData: any): Promise<{ data: any; success: boolean; id?: number; }> => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(`${SECONDARYAPI}/api/store/payment`, postData, { headers });

    console.log('Primary payment saved:', data);

    return { 
      data, 
      success: true, 
      id: data?.data?.id, 
    };
  } catch (error: any) {
    ToastAndroid.show('Payment failed. Try again.', ToastAndroid.LONG);
    console.error('userPayPremiumSave error:', error.response?.data || error.message);
    console.log('Failed payment data:', postData);
    console.log('Error details:', error);
    return { data: null, success: false };
  }
};

export const userPayPremiumUpdate = async (postData: any): Promise<{ data: any; success: boolean }> => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(`${SECONDARYAPI}/api/update/payment`, postData, { headers });

    return { data, success: true };
  } catch (error: any) {
    console.error('userPayPremiumUpdate error:', error.response?.data || error.message);
    return { data: null, success: false };
  }
};

export const userPayFirstPremiumSave = async (postData: any): Promise<{ success: boolean; message?: string; id?: number; }> => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(`${SECONDARYAPI}/api/store/first_premium`, postData, { headers });

    if (data.errors) {
      ToastAndroid.show(data.message || 'Payment failed', ToastAndroid.LONG);
      return { success: false, message: data.message };
    }

    return { 
      success: true, 
      message: data.message, 
      id: data?.data?.id, 
    };
  } catch (error: any) {
    ToastAndroid.show(error.message || 'Payment failed', ToastAndroid.LONG);
    console.error('userPayFirstPremiumSave error:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};

export const userPayFirstPremiumUpdate = async (postData: any): Promise<{ success: boolean; message?: string }> => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(`${SECONDARYAPI}/api/update/first_premium`, postData, { headers });

    if (data.errors) {
      ToastAndroid.show(data.message || 'Payment failed', ToastAndroid.LONG);
      return { success: false, message: data.message };
    }

    return { success: true, message: data.message };
  } catch (error: any) {
    console.error('userPayFirstPremiumUpdate error:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};





// ──────────────────────────────────────────────────────────────
// CODE-WISE COLLECTION ACTIONS
// ──────────────────────────────────────────────────────────────

export const getCodeWiseCollectionSummary = async (
  projectCode: string,
  designation: string,
  code: string
) => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(
      `${API}/api/code-wise-collection-summary`,
      { project_code: projectCode, designation, code },
      { headers }
    );
    return data;
  } catch (error: any) {
    console.error('Summary fetch error:', error.response?.data || error.message);
    throw error;
  }
};

export const getCodeWiseCollectionDetails = async (
  projectCode: string,
  designation: string,
  code: string
) => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post(
      `${API}/api/code-wise-collection-details`,
      { project_code: projectCode, designation, code },
      { headers }
    );
    return data;
  } catch (error: any) {
    console.error('Details fetch error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchDesignations = async () => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.get(`${API}/api/designations`, { headers });
    return data;
  } catch (error: any) {
    console.error('Failed to fetch designations:', error);
    throw error;
  }
};


// ──────────────────────────────────────────────────────────────
// 2. AUTH ACTIONS (LOGIN, REGISTER, LOGOUT, ETC)
// ──────────────────────────────────────────────────────────────
export const login = (postData: any): any => async (dispatch: any) => {
  try {
    console.log('🔵 Login attempt started with:', postData);
    dispatch({ type: SHOW_LOADING });
    dispatch({ type: LOGIN_REQUEST });

    console.log('🌐 Making request to:', `${API}/api/login`);
    const { data } = await axios.post(`${API}/api/login`, postData);

    console.log('📨 Response received:', data);

    if (data.errors) {
      const formattedErrors: Record<string, string> = {};

      Object.keys(data.errors).forEach(key => {
        formattedErrors[key] = Array.isArray(data.errors[key])
          ? data.errors[key][0]
          : data.errors[key];
      });

      dispatch({ type: LOGIN_FAIL, payload: 'Validation failed' });
      dispatch({ type: HIDE_LOADING });

      // ✅ THROW instead of return
      throw { errors: formattedErrors };
    }

    if (data.errorMessage) {
      dispatch({ type: LOGIN_FAIL, payload: 'Validation failed' });
      dispatch({ type: HIDE_LOADING });

      throw {
        errors: { password: data.errorMessage },
      };
    }

    console.log('✅ Login successful, saving to storage');
    await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
    await AsyncStorage.setItem('token', JSON.stringify(data.data.token));

    // Save credentials if "Remember Me" checked
    if (postData.isRemember) {
      const saved = JSON.parse((await AsyncStorage.getItem('savedcredentials')) || '[]');
      if (!saved.some((cred: any) => cred.userName === postData.phone)) {
        saved.push({ userName: postData.phone, password: postData.password });
        await AsyncStorage.setItem('savedcredentials', JSON.stringify(saved));
      }
    }

    dispatch({
      type: LOGIN_SUCCESS,
      payload: { user: data.data.user, token: data.data.token },
    });

    dispatch({ type: HIDE_LOADING });
    return data;
  } catch (error: any) {
    console.log('💥 Login failed with error:', error);
    console.log('Error response:', error.response?.data);
    console.log('Error message:', error.message);


    dispatch({ type: LOGIN_FAIL, payload: error.message || 'Login failed' });
    dispatch({ type: HIDE_LOADING });
    throw error?.errors
      ? error
      : { errors: { general: error.message || 'Login failed' } };
  }
};

export const register = (postData: any) => async (dispatch: any) => {
  try {
    const { data } = await axios.post(`${API}/api/registration`, postData);
    ToastAndroid.show(data.message, ToastAndroid.LONG);
    return data.status === 200 ? true : data;
  } catch (error: any) {
    ToastAndroid.show(error.message || 'Registration failed', ToastAndroid.LONG);
    return false;
  }
};

export const verifyRegistration = (postData: any) => async (dispatch: any) => {
  try {
    const { data } = await axios.post(`${API}/api/verify-registration`, postData);
    if (data.errorMessage) {
      ToastAndroid.show(data.errorMessage, ToastAndroid.LONG);
      return false;
    }
    if (data.data?.token) {
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      await AsyncStorage.setItem('token', JSON.stringify(data.data.token));
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: data.data.user, token: data.data.token },
      });
      ToastAndroid.show(data.message, ToastAndroid.LONG);
      return true;
    }
    return false;
  } catch (error: any) {
    ToastAndroid.show('Verification failed', ToastAndroid.LONG);
    return false;
  }
};

export const loadUser = () => async (dispatch: any) => {
  try {
    dispatch({ type: LOAD_USER_REQUEST });

    const token = await AsyncStorage.getItem('token');
    if (!token) return dispatch({ type: LOAD_USER_FAIL });

    const headers = await getAuthHeaders();
    const { data } = await axios.get(`${API}/api/user`, { headers });

    dispatch({
      type: LOGIN_SUCCESS,
      payload: { user: data.data.user, token: JSON.parse(token) },
    });

    await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
  } catch (error) {
    dispatch({ type: LOAD_USER_FAIL });
  }
};

export const logout = (navigation: any) => async (dispatch: any) => {
  Alert.alert('Logout', 'Are you sure you want to logout?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'YES',
      onPress: async () => {
        // First: close the drawer immediately
        navigation.closeDrawer();

        // Then: clear storage and state
        await AsyncStorage.multiRemove(['user', 'token']);
        dispatch({ type: LOGOUT_SUCCESS });
        ToastAndroid.show('Logged out successfully', ToastAndroid.LONG);

        // Finally: reset root navigation
        if (rootNavigationRef.isReady()) {
          rootNavigationRef.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      },
    },
  ]);
};

// ──────────────────────────────────────────────────────────────
// 3. PASSWORD & PROFILE ACTIONS (KEEP ALL — USED IN SETTINGS)
// ──────────────────────────────────────────────────────────────
export const resetPassword = async (postData: any) => {
  try {
    const { data } = await axios.post(`${API}/api/reset-password`, postData);
    ToastAndroid.show(data.successMessage || data.errorMessage, ToastAndroid.LONG);
    return data.status === 200;
  } catch (error: any) {
    ToastAndroid.show(error.message, ToastAndroid.LONG);
    return false;
  }
};

export const verifyForgotPasswordOtp = async (postData: any) => {
  try {
    const { data } = await axios.post(`${API}/api/verify-forgot-password-otp`, postData);
    ToastAndroid.show(data.message || data.errorMessage, ToastAndroid.LONG);
    return data.status === 200;
  } catch (error: any) {
    ToastAndroid.show('Invalid OTP', ToastAndroid.LONG);
    return false;
    false;
  }
};

export const getforgotPasswordOtp = async (postData: any) => {
  try {
    const { data } = await axios.post(`${API}/api/forgot-password`, postData);
    ToastAndroid.show(data.successMessage || data.message, ToastAndroid.LONG);
    return data.status === 200;
  } catch (error: any) {
    ToastAndroid.show('Failed to send OTP', ToastAndroid.LONG);
    return false;
  }
};

// ──────────────────────────────────────────────────────────────
// 4. RATE & AGENT CODES (USED IN PREMIUM CALCULATOR)
// ──────────────────────────────────────────────────────────────
export const getRate = async (projectCode: string, plan: string, term: string, age: number) => {
  try {
    if (!projectCode || !plan || !term || !age) return { success: false, rate: 0 };

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      ToastAndroid.show('Session expired', ToastAndroid.LONG);
      return { success: false, rate: 0 };
    }

    const planStr = String(plan).padStart(2, '0');
    const termStr = String(term).padStart(2, '0');
    const ageStr = String(age).padStart(2, '0');
    const code = `${planStr}${termStr}${ageStr}`;

    const { data } = await axios.get(`${API}/api/get-rate/${projectCode}/${code}`, {
      headers: { Authorization: `Bearer ${JSON.parse(token)}` },
    });

    const rate = parseFloat(data.data?.rate);
    return rate > 0 ? { success: true, rate } : { success: false, rate: 0 };
  } catch (error: any) {
    ToastAndroid.show('Rate not available', ToastAndroid.SHORT);
    return { success: false, rate: 0 };
  }
};

export const getAgentCodes = async (faCode: string, projectCode: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const { data } = await axios.get(`${API}/api/get-agent-codes/${projectCode}/${faCode}`, {
      headers: { Authorization: `Bearer ${JSON.parse(token || '')}` },
    });

    if (data.status === 200 && data.data) {
      return { success: true, um: data.data.UM, bm: data.data.BM, agm: data.data.AGM };
    }
    return { success: false };
  } catch (error) {
    ToastAndroid.show('Invalid FA Code', ToastAndroid.LONG);
    return { success: false };
  }
};


// ──────────────────────────────────────────────────────────────
// 5. FETCH PROJECTS — THE ONE YOU WERE MISSING (FIXED & PERMANENT)
// ──────────────────────────────────────────────────────────────
export const fetchProjects = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const { data } = await axios.get(`${API}/api/projects`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JSON.parse(token)}`,
      },
    });

    console.log('Projects fetched:', data.data);
    return data; // { status: 200, data: [...] }
  } catch (error: any) {
    console.error('Error fetching projects: ', error.response?.data || error.message);
    ToastAndroid.show('Failed to load projects', ToastAndroid.SHORT);
    throw error;
  }
};

// ──────────────────────────────────────────────────────────────
// 6. CLEAR ERRORS
// ──────────────────────────────────────────────────────────────
export const clearErrors = () => async (dispatch: any) => {
  dispatch({ type: CLEAR_ERRORS });
};

