import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  Dimensions,
  Alert, 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import globalStyle from '../../styles/globalStyle';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import {
  getforgotPasswordOtp,
  verifyForgotPasswordOtp,
} from '../../actions/userActions';
import BackgroundImage from '../../assets/bg-login.png';
import { COMPANY_NAME, COMPANY_LOGO } from '../../config';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants'; 

const { height } = Dimensions.get('window');

type ForgotPasswordScreenProps = {
  navigation: any;
};

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, error, loading } = useSelector((state: any) => state.auth); 

  const [isSentOtp, setIsSentOtp] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false); 


  const handleSubmit = async () => {
    if (loading) return;

    if (!phone) {
        Alert.alert('Error', 'Please enter your phone number.');
        return;
    }

    let postData = {
      phone: phone,
    };
    
    dispatch({ type: SHOW_LOADING, payload: 'Requesting OTP...' });

    try {
        const isSuccess: boolean = await getforgotPasswordOtp(postData);
        
        if (isSuccess) {
            setIsSentOtp(true);
            Alert.alert('Success', 'OTP sent to your phone number.');
        } else {
            Alert.alert('Error', error || 'Failed to send OTP. Please check your phone number.');
        }
    } catch (apiError: any) {
        Alert.alert('Error', apiError.message || 'Network error occurred.');
    } finally {
        dispatch({ type: HIDE_LOADING });
    }
  };

  const handleVerify = async () => {
    if (loading) return;

    if (!otp) {
        Alert.alert('Error', 'Please enter the OTP.');
        return;
    }

    let postData = {
      phone: phone,
      otp: otp,
    };

    dispatch({ type: SHOW_LOADING, payload: 'Verifying OTP...' });

    try {
        const isSuccess: boolean = await verifyForgotPasswordOtp(postData);

        if (isSuccess === true) {
            setIsSentOtp(false);
            navigation.navigate('ResetPassword', { phone: phone });
        } else {
            Alert.alert('Error', error || 'OTP verification failed. Please try again.');
        }
    } catch (apiError: any) {
        Alert.alert('Error', apiError.message || 'Network error occurred during verification.');
    } finally {
        dispatch({ type: HIDE_LOADING });
    }
  };

  return (
    <View style={globalStyle.container}>
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
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ width: 85, height: 85 }}>
              <Image style={{ height: '100%', width: '100%' }} source={COMPANY_LOGO} />
            </View>

            <Text style={[globalStyle.fontFjallaOne, { fontSize: 24, color: '#000', marginTop: 5 }]}>
              {COMPANY_NAME}
            </Text>
          </View>
        </ImageBackground>
      </View>
      <View style={{ height: '60%', backgroundColor: '#FFF', borderTopLeftRadius: 50, borderTopRightRadius: 50 }}>
        <ScrollView>
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={[globalStyle.fontFjallaOne, { fontSize: 26 }]}>Forgot Password</Text>

            {/* --- OTP Request Phase --- */}
            {!isSentOtp && (
              <View style={{ width: '100%', marginTop: 15 }}>
                <Input
                  label={'Phone No'}
                  placeholder={''}
                  value={phone}
                  onChangeText={setPhone}
                  style={{ backgroundColor: '#D0D0D0' }}
                  editable={!loading} 
                />

                <FilledButton
                  title={loading ? 'Sending OTP...' : 'Submit'} 
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
            )}

            {/* --- OTP Verification Phase --- */}
            {isSentOtp && (
              <View style={{ width: '100%', marginTop: 15 }}>
                <Input
                  label={'Phone No'}
                  placeholder={''}
                  value={phone}
                  onChangeText={setPhone}
                  style={{ backgroundColor: '#D0D0D0' }}
                  editable={false} 
                />

                <Input
                  label={'OTP'}
                  placeholder={''}
                  value={otp}
                  onChangeText={setOtp}
                  style={{ backgroundColor: '#D0D0D0' }}
                  keyboardType='numeric' 
                  editable={!loading} 
                />

                <FilledButton
                  title={loading ? 'Verifying...' : 'Verify'} 
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
            <Text onPress={() => navigation.navigate('Login')} style={[globalStyle.font]}>
              Go to Login
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;