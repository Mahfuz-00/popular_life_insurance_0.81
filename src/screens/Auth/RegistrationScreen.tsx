import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  Dimensions,
  Alert, // Added Alert for error display
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import globalStyle from '../../styles/globalStyle';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { SecuredInput } from '../../components/input/SecuredInput';
import { register, verifyRegistration, clearErrors } from '../../actions/userActions';
import BackgroundImage from '../../assets/bg-login.png';
import { COMPANY_NAME, COMPANY_LOGO } from '../../config';
import type { AppDispatch } from '../../store';
// ⭐️ Import loading constants
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants'; 
import EnglishOnlyInput from '../../components/input/EnglishOnlyInput';

const { height } = Dimensions.get('window');

type RegistrationScreenProps = {
  navigation: any;
};

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  // ⭐️ Destructure loading from Redux state (assuming it's available in state.auth)
  const { isAuthenticated, user, error, loading } = useSelector((state: any) => state.auth); 

  const [isSentOtp, setIsSentOtp] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  const handleSubmit = async () => {
    if (loading) return; // Prevent double submission

    setErrors({});

    const postData = {
      name,
      phone,
      email,
      password,
      confirm_password: confirmPassword,
    };
    
    dispatch({ type: SHOW_LOADING, payload: 'Registering user...' });

    try {
        // Assume register is a thunk that returns a result object or throws an error
        const result = await dispatch(register(postData));

        if (result.errors) {
            setErrors(result.errors);
            // Optionally show a general error alert
            Alert.alert('Registration Failed', 'Please fix the errors shown below.');
        } else {
            setIsSentOtp(true);
            Alert.alert('OTP Sent', 'A verification code has been sent to your phone.');
        }
    } catch (apiError: any) {
        Alert.alert('Error', apiError.message || 'Network error occurred during registration.');
    } finally {
        dispatch({ type: HIDE_LOADING });
    }
  };

  const handleVerify = async () => {
    if (loading) return; // Prevent double submission

    if (!otp) {
        Alert.alert('Error', 'Please enter the OTP.');
        return;
    }
    
    const postData = {
      phone,
      otp,
    };

    dispatch({ type: SHOW_LOADING, payload: 'Verifying OTP...' });

    try {
        // Assume verifyRegistration is a thunk that handles login on success
        const isSuccess: boolean = await dispatch(verifyRegistration(postData));
        
        // If isSuccess is false or an error occurred, the error should be handled by the useEffect or manually here
        // Note: Since verifyRegistration handles navigation on success, explicit handling of success might be minimal.
        if (!isSuccess) {
            Alert.alert('Verification Failed', error || 'The OTP entered is incorrect or expired.');
            dispatch(clearErrors());
        }

    } catch (apiError: any) {
        Alert.alert('Error', apiError.message || 'Network error occurred during verification.');
    } finally {
        dispatch({ type: HIDE_LOADING });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.type === 'policy holder') {
        navigation.replace('PhPolicyList');
      } else if (user?.type === 'agent') {
        navigation.replace('DashboardProducer');
      }
    }

    if (error) {
      // Alert.alert('Error', error); // Optional: show error alert here
      dispatch(clearErrors());
    }
  }, [dispatch, isAuthenticated, user, error, navigation]);
  
  // ⭐️ Determine if inputs should be editable
  const isInputEditable = !loading;
  // ⭐️ Determine button titles
  const registerButtonTitle = loading && !isSentOtp ? 'Registering...' : 'Register';
  const verifyButtonTitle = loading && isSentOtp ? 'Verifying...' : 'Verify';


  return (
    <View style={globalStyle.container}>
      {/* Top Background */}
      <View style={{ height: '40%' }}>
        <ImageBackground source={BackgroundImage} style={{ flex: 1 }} resizeMode="stretch">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15 }}>
            <Icon
              name="ios-menu"
              size={24}
              color="#000"
              style={{ backgroundColor: '#FFF', padding: 3, borderRadius: 8 }}
              onPress={() => navigation.toggleDrawer()}
            />
            <Icon
              name="ios-search"
              size={24}
              color="#000"
              style={{ backgroundColor: '#FFF', padding: 3, borderRadius: 8 }}
            />
          </View>

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 85, height: 85 }}>
              <Image style={{ height: '100%', width: '100%' }} source={COMPANY_LOGO} />
            </View>
            <Text style={[globalStyle.fontFjallaOne, { fontSize: 24, color: '#000', marginTop: 5 }]}>
              {COMPANY_NAME}
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Bottom Form Card */}
      <View style={{ height: '60%', backgroundColor: '#FFF', borderTopLeftRadius: 50, borderTopRightRadius: 50 }}>
        <ScrollView>
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={[globalStyle.fontFjallaOne, { fontSize: 26 }]}>Registration</Text>
            <Text style={[globalStyle.fontMedium]}>Create your account</Text>

            {/* Registration Form */}
            {!isSentOtp ? (
              <View style={{ width: '100%', marginTop: 15 }}>
                <EnglishOnlyInput
                  label={'Name'}
                  placeholder={''}
                  value={name}
                  onChangeText={setName}
                  errors={errors}
                  errorField={'name'}
                  style={{ backgroundColor: '#D0D0D0' }}
                  editable={isInputEditable} 
                />

                <Input
                  label={'Phone'}
                  placeholder={''}
                  value={phone}
                  onChangeText={setPhone}
                  errors={errors}
                  errorField={'phone'}
                  style={{ backgroundColor: '#D0D0D0' }}
                  keyboardType="phone-pad"
                  editable={isInputEditable} 
                />

                <Input
                  label={'Email'}
                  placeholder={''}
                  value={email}
                  onChangeText={setEmail}
                  errors={errors}
                  errorField={'email'}
                  style={{ backgroundColor: '#D0D0D0' }}
                  keyboardType="email-address"
                  editable={isInputEditable} 
                />

                <SecuredInput
                  label={'Password'}
                  placeholder={''}
                  value={password}
                  onChangeText={setPassword}
                  errors={errors}
                  errorField={'password'}
                  style={{ backgroundColor: '#FFF' }}
                  editable={isInputEditable} 
                />

                <SecuredInput
                  label={'Confirm Password'}
                  placeholder={''}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  errors={errors}
                  errorField={'confirm_password'}
                  style={{ backgroundColor: '#FFF' }}
                  editable={isInputEditable} 
                />

                <FilledButton
                  title={registerButtonTitle}
                  style={{
                    width: '40%',
                    borderRadius: 50,
                    alignSelf: 'center',
                    marginVertical: 10,
                    backgroundColor: '#EE4E89',
                  }}
                  onPress={handleSubmit}
                  disabled={loading} 
                />
              </View>
            ) : (
              /* OTP Verification */
              <View style={{ width: '100%', marginTop: 15 }}>
                <Input
                  label={'OTP'}
                  placeholder={'Enter OTP'}
                  value={otp}
                  onChangeText={setOtp}
                  style={{ backgroundColor: '#D0D0D0' }}
                  keyboardType="numeric"
                  editable={isInputEditable} 
                />

                <FilledButton
                  title={verifyButtonTitle} 
                  style={{
                    width: '40%',
                    borderRadius: 50,
                    alignSelf: 'center',
                    marginVertical: 10,
                    backgroundColor: '#EE4E89',
                  }}
                  onPress={handleVerify}
                  disabled={loading} 
                />
              </View>
            )}

            <Text
              onPress={() => navigation.navigate('Login')}
              style={[globalStyle.fontMedium, { marginTop: 20, color: '#0066CC' }]}
            >
              Already have an account? Login
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default RegistrationScreen;