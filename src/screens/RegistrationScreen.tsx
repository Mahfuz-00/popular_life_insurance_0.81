import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import globalStyle from '../styles/globalStyle';
import { Input } from '../components/Input';
import { FilledButton } from '../components/FilledButton';
import { SecuredInput } from '../components/SecuredInput';
import { register, verifyRegistration, clearErrors } from '../actions/userActions';
import BackgroundImage from '../assets/bg-login.png';
import { COMPANY_NAME, COMPANY_LOGO } from '../config';
import type { AppDispatch } from '../store';

const { height } = Dimensions.get('window');

type RegistrationScreenProps = {
  navigation: any;
};

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, error } = useSelector((state: any) => state.auth);

  const [isSentOtp, setIsSentOtp] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  const handleSubmit = async () => {
    setErrors({});

    const postData = {
      name,
      phone,
      email,
      password,
      confirm_password: confirmPassword,
    };

    const result = await dispatch(register(postData));

    if (result.errors) {
      setErrors(result.errors);
    } else {
      setIsSentOtp(true);
    }
  };

  const handleVerify = async () => {
    const postData = {
      phone,
      otp,
    };

    const isSuccess = await dispatch(verifyRegistration(postData));
    // No need to do anything — verifyRegistration handles login on success
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
      dispatch(clearErrors());
    }
  }, [dispatch, isAuthenticated, user, error, navigation]);

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
                <Input
                  label={'Name'}
                  placeholder={''}
                  value={name}
                  onChangeText={setName}
                  errors={errors}
                  errorField={'name'}
                  style={{ backgroundColor: '#D0D0D0' }}
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
                />

                <SecuredInput
                  label={'Password'}
                  placeholder={''}
                  value={password}
                  onChangeText={setPassword}
                  errors={errors}
                  errorField={'password'}
                  style={{ backgroundColor: '#FFF' }}
                />

                <SecuredInput
                  label={'Confirm Password'}
                  placeholder={''}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  errors={errors}
                  errorField={'confirm_password'}
                  style={{ backgroundColor: '#FFF' }}
                />

                <FilledButton
                  title={'Register'}
                  style={{
                    width: '40%',
                    borderRadius: 50,
                    alignSelf: 'center',
                    marginVertical: 10,
                    backgroundColor: '#EE4E89',
                  }}
                  onPress={handleSubmit}
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
                />

                <FilledButton
                  title={'Verify'}
                  style={{
                    width: '40%',
                    borderRadius: 50,
                    alignSelf: 'center',
                    marginVertical: 10,
                    backgroundColor: '#EE4E89',
                  }}
                  onPress={handleVerify}
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