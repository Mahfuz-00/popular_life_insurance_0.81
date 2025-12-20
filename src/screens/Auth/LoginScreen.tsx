import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ToastAndroid,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { unwrapResult } from '@reduxjs/toolkit'

import globalStyle from '../../styles/globalStyle';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { SecuredInput } from '../../components/input/SecuredInput';
import BackgroundImage from '../../assets/bg-login.png';
import { COMPANY_NAME, COMPANY_LOGO } from '../../config';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearErrors } from '../../actions/userActions';
import type { RootState, AppDispatch } from '../../store';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants'; 

const { height } = Dimensions.get('window');

interface SavedCredential {
  userName: string;
  password: string;
}

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isRemember, setIsRemember] = useState(false);
  const [isShowSavedAccounts, setIsShowSavedAccounts] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<SavedCredential[]>([]);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!userName || !password) {
        setErrors({ phone: 'Phone number is required.', password: 'Password is required.' });
        return;
    }
    setErrors({});
    setIsSubmitting(true);
    dispatch({ type: SHOW_LOADING, payload: 'Logging in...' }); 

    try {
        // const resultAction = await dispatch(login({ phone: userName, password, isRemember }));
        // unwrapResult(resultAction); 

        await dispatch(login({ phone: userName, password, isRemember }));

        // Success — no errors
        console.log('🟢 Login successful');
        // Navigation will happen in useEffect watching isAuthenticated
      
    } catch (apiError: any) {
      console.log('🔴 Caught error in handleSubmit:', apiError);
      console.log('🔴 apiError.errors:', apiError?.errors);
      console.log('🔴 About to call setErrors with:', apiError?.errors);

      if (apiError?.errors) {
        setErrors(apiError.errors);
        console.log('🟢 setErrors called');
      }
        
        if (typeof apiError === 'string') {
            ToastAndroid.show(apiError, ToastAndroid.LONG);
        }

        if (apiError.errors.general) {
          ToastAndroid.show(
            apiError.errors.general,
            ToastAndroid.LONG
          );
        }
        
        dispatch(clearErrors());

    } finally {
        setIsSubmitting(false); 
        dispatch({ type: HIDE_LOADING }); 
    }
  };

  const showSavedAccounts = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedcredentials');
      setSavedCredentials(saved ? JSON.parse(saved) : []);
      setIsShowSavedAccounts(true);
    } catch (err) {
      setSavedCredentials([]);
      setIsShowSavedAccounts(true);
    }
  };

  const selectSavedAccount = (cred: SavedCredential) => {
    setUserName(cred.userName);
    setPassword(cred.password);
    setIsShowSavedAccounts(false);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.type === 'policy holder') {
        navigation.replace('PhPolicyList');
      } else if (user.type === 'agent') {
        navigation.replace('DashboardProducer');
      }
    }

    if (error) {
      ToastAndroid.show(error, ToastAndroid.LONG);
      dispatch(clearErrors());
    }
  }, [isAuthenticated, user, error, navigation, dispatch]);

  return (
    <View style={globalStyle.container}>
      {/* Saved Accounts Modal */}
      <Modal animationType="fade" transparent visible={isShowSavedAccounts}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {savedCredentials.length === 0 ? (
                <Text style={styles.noAccountsText}>No saved accounts</Text>
              ) : (
                savedCredentials.map((cred, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.savedAccountItem}
                    onPress={() => selectSavedAccount(cred)}
                  >
                    <Text style={styles.savedAccountText}>
                      {cred.userName} / *****
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <FilledButton
              title="Close"
              style={styles.closeButton}
              onPress={() => setIsShowSavedAccounts(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Header with Background */}
      <View style={{ height: '40%' }}>
        <ImageBackground source={BackgroundImage} style={styles.headerBg} resizeMode="stretch">
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image source={COMPANY_LOGO} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.companyName}>{COMPANY_NAME}</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Login to Continue</Text>

            <View style={styles.inputContainer}>
              <Input
                label="Phone No"
                value={userName}
                onChangeText={setUserName}
                placeholder="01XXXXXXXXX"
                keyboardType="phone-pad"
                errors={errors}
                errorField="phone"
              />

              <TouchableOpacity style={styles.savedAccountsLink} onPress={showSavedAccounts}>
                <Text style={styles.linkText}>Saved Accounts </Text>
                <Icon name="bookmark-outline" size={22} color="#EE4E89" />
              </TouchableOpacity>

              <SecuredInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                errors={errors}
                errorField="password"
              />

              <View style={styles.rememberRow}>
                <CheckBox
                  value={isRemember}
                  onValueChange={setIsRemember}
                  tintColors={{ true: '#EE4E89', false: '#666' }}
                />
                <Text style={styles.rememberText}>Remember Me?</Text>
              </View>

              <FilledButton
                title={isSubmitting ? 'Logging in...' : 'Login'}
                onPress={handleSubmit}
                style={styles.loginButton}
                disabled={isSubmitting}
              />

              <Text style={styles.forgotText} onPress={() => navigation.navigate('ForgotPassword')}>
                Forgot Password?
              </Text>

              <Text style={styles.signupText} onPress={() => navigation.navigate('Registration')}>
                Don't have an account? Sign up
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBg: { flex: 1 },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  iconBg: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 12,
    elevation: 3,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '15%',
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
  },
  logo: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'contain',
   },
  companyName: {
    ...globalStyle.fontFjallaOne,
    fontSize: 26,
    color: '#000',
    marginTop: 10,
  },
  formContainer: {
    height: '65%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: -40,
  },
  form: { padding: 20, alignItems: 'center' },
  title: { ...globalStyle.fontFjallaOne, fontSize: 32, color: '#EE4E89' },
  subtitle: { ...globalStyle.font, color: '#666', marginBottom: 20 },
  inputContainer: { width: '100%' },
  savedAccountsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  linkText: { color: '#EE4E89', fontWeight: '600' },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  rememberText: { ...globalStyle.font, marginLeft: 8 },
  loginButton: {
    width: '50%',
    alignSelf: 'center',
    marginVertical: 20,
    backgroundColor: '#EE4E89',
    borderRadius: 50,
  },
  forgotText: { ...globalStyle.font, color: '#EE4E89', textDecorationLine: 'underline', textAlign: 'center' },
  signupText: { ...globalStyle.font, marginTop: 15, color: '#666', textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: 420,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 20,
  },
  savedAccountItem: {
    backgroundColor: '#EE4E89',
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: 'center',
  },
  savedAccountText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  noAccountsText: { textAlign: 'center', color: '#666', marginTop: 50, fontSize: 16 },
  closeButton: {
    width: '40%',
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#EE4E89',
    borderRadius: 50,
  },
});

export default LoginScreen;