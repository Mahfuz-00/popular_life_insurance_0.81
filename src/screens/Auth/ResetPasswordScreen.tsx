import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import globalStyle from '../../styles/globalStyle';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { resetPassword } from '../../actions/userActions';
import BackgroundImage from '../../assets/bg-login.png';
import { COMPANY_NAME, COMPANY_LOGO } from '../../config';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants';

const { height } = Dimensions.get('window');

type ResetPasswordScreenProps = {
  navigation: any;
  route: {
    params: {
      phone: string;
    };
  };
};

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { phone } = route.params;

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLoading) return; 

    if (!password || !confirmPassword) {
        Alert.alert('Error', 'Please enter both password fields.');
        return;
    }

    if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match.');
        return;
    }

    const postData = {
      phone: phone,
      password: password,
      confirm_password: confirmPassword,
    };

    setIsLoading(true);
    dispatch({ type: SHOW_LOADING, payload: 'Resetting password...' });

    try {
        const isSuccess = await resetPassword(postData); 

        if (isSuccess) {
            Alert.alert('Success', 'Your password has been reset successfully. Please log in.');
            navigation.replace('Login');
        } else {
            Alert.alert('Error', 'Failed to reset password. Please try again.');
        }
    } catch (apiError: any) {
        Alert.alert('Error', apiError.message || 'Network error occurred.');
    } finally {
        setIsLoading(false);
        dispatch({ type: HIDE_LOADING });
    }
  };

  return (
    <View style={globalStyle.container}>
      {/* Top Background Section */}
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

      {/* Bottom White Card */}
      <View style={{ height: '60%', backgroundColor: '#FFF', borderTopLeftRadius: 50, borderTopRightRadius: 50 }}>
        <ScrollView>
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={[globalStyle.fontFjallaOne, { fontSize: 26 }]}>Reset Password</Text>

            <View style={{ width: '100%', marginTop: 15 }}>
              <Input
                label={'Password'}
                placeholder={''}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                style={{ backgroundColor: '#D0D0D0' }}
                editable={!isLoading}
              />

              <Input
                label={'Confirm Password'}
                placeholder={''}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                style={{ backgroundColor: '#D0D0D0' }}
                editable={!isLoading}
              />

              <FilledButton
                title={isLoading ? 'Submitting...' : 'Submit'}
                style={{
                  width: '40%',
                  borderRadius: 50,
                  alignSelf: 'center',
                  marginVertical: 10,
                  backgroundColor: '#EE4E89',
                }}
                onPress={handleSubmit}
                disabled={isLoading}
              />
            </View>

            <Text
              onPress={() => navigation.navigate('Login')}
              style={[globalStyle.fontMedium, { marginTop: 20, color: '#0066CC' }]}
            >
              Go to Login
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default ResetPasswordScreen;