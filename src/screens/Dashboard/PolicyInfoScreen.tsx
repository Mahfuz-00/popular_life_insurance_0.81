import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import BackgroundImage from '../../assets/BackgroundImage.png';
import globalStyle from '../../styles/globalStyle';
import Header from '../../components/Header';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { DatePickerComponent } from '../../components/DatePickerComponent';
import { getPolicyDetails } from '../../actions/policyServiceActions';
import type { AppDispatch } from '../../store';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants'; 

type PolicyInfoScreenProps = {
  navigation: any;
};

interface PolicyDetails {
  name: string;
  plan: string;
  tarm: string;
  sumAssured: string | number;
  totalPremium: string | number;
  mode: string;
}

const PolicyInfoScreen: React.FC<PolicyInfoScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [policyNumber, setPolicyNumber] = useState<string>('');
  const [phoneNo, setPhoneNo] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [sentOtp, setSentOtp] = useState<string>('');
  const [policyDetails, setPolicyDetails] = useState<PolicyDetails | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date('1990-01-01'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClear = () => {
    setPolicyDetails(null);
    setSentOtp('');
    setOtp('');
    setPolicyNumber('');
    setPhoneNo('');
    setDateOfBirth(new Date('1990-01-01'));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Basic Validation Check before making API call
    if (!policyNumber.trim() || !phoneNo.trim()) {
        Alert.alert('Validation Required', 'Please enter Policy Number and Phone Number.');
        return;
    }
    
    // If OTP was sent but not entered
    if (sentOtp && !otp.trim()) {
        Alert.alert('Validation Required', 'Please enter the OTP sent to your phone.');
        return;
    }

    setIsSubmitting(true); 
    dispatch({ type: SHOW_LOADING, payload: sentOtp ? 'Verifying OTP and fetching details...' : 'Requesting OTP...' }); 

    const postDataWithOtp = {
      policyNo: policyNumber,
      dob: moment(dateOfBirth).format('YYYY-MM-DD'),
      phoneNo: phoneNo,
      code: otp,
    };

    const postDataWithoutOtp = {
      policyNo: policyNumber,
      dob: moment(dateOfBirth).format('YYYY-MM-DD'),
      phoneNo: phoneNo,
    };

    try {
        const res = await dispatch(getPolicyDetails(sentOtp ? postDataWithOtp : postDataWithoutOtp));

        if (!res.data) {
            Alert.alert('Error', 'Invalid data or request failed.');
            return;
        }

        if (res.data.code) {
            setSentOtp(res.data.code);
            Alert.alert('Success', 'OTP sent to your registered phone number.');
            setOtp(''); 
        } else if (res.data.name) {
            setPolicyDetails({
                name: res.data.name,
                sumAssured: res.data.sumAssured,
                totalPremium: res.data.totalPremium,
                plan: res.data.plan,
                tarm: res.data.tarm,
                mode: res.data.mode,
            });
            setSentOtp('');
            setOtp('');
        } else {
            Alert.alert('Error', res.data.message || 'Verification failed. Please check your details or OTP.');
        }
    } catch (error) {
        console.error('Policy lookup failed:', error);
        Alert.alert('Error', 'A network error occurred or server is unreachable.');
    } finally {
        setIsSubmitting(false); 
        dispatch({ type: HIDE_LOADING }); 
    }
  };

  const submitButtonTitle = isSubmitting 
    ? (sentOtp ? 'VERIFYING...' : 'SENDING OTP...') 
    : (sentOtp ? 'Verify OTP' : 'Submit');

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title={'Policy Information'} />

        <ScrollView>
          <View style={globalStyle.wrapper}>
            <Input
              label={'Policy Number'}
              placeholder={''}
              value={policyNumber}
              onChangeText={setPolicyNumber}
              keyboardType='numeric'
              labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
              editable={!sentOtp&& !isSubmitting}
            />

            <DatePickerComponent
              date={dateOfBirth}
              setDate={setDateOfBirth}
              label={'Birth Date'}
              labelStyle={{ color: '#FFF' }}
              editable={!sentOtp&& !isSubmitting}
            />

            <Input
              label={'Phone No.'}
              placeholder={''}
              value={phoneNo}
              onChangeText={setPhoneNo}
              keyboardType='phone-pad'
              labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
              editable={!sentOtp&& !isSubmitting}
            />

            {sentOtp && (
              <Input
                label={'OTP'}
                placeholder={''}
                value={otp}
                onChangeText={setOtp}
                keyboardType='numeric'
                labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
                editable={!isSubmitting}
              />
            )}

            {policyDetails ? (
              <FilledButton
                title={'Clear'}
                style={{
                  width: '40%',
                  borderRadius: 50,
                  alignSelf: 'center',
                  marginVertical: 10,
                  backgroundColor: '#EE4E89',
                }}
                onPress={handleClear}
              />
            ) : (
              <FilledButton
                title={submitButtonTitle}
                style={{
                  width: '40%',
                  borderRadius: 50,
                  alignSelf: 'center',
                  marginVertical: 10,
                  backgroundColor: '#EE4E89',
                }}
                onPress={handleSubmit}
                disabled={isSubmitting}
              />
            )}

            {policyDetails && (
              <View
                style={{
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                  borderRightWidth: 2,
                  borderColor: '#5382AC',
                  marginVertical: 15,
                }}
              >
                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Name</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {policyDetails.name}
                  </Text>
                </View>

                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Plan</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {policyDetails.plan}
                  </Text>
                </View>

                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Term</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {policyDetails.tarm}
                  </Text>
                </View>

                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Sum Assured</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {policyDetails.sumAssured}
                  </Text>
                </View>

                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Total Premium</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {policyDetails.totalPremium}
                  </Text>
                </View>

                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Mode</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {policyDetails.mode}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 2,
    borderColor: '#5382AC',
  },
  rowLable: {
    flex: 1,
    textAlign: 'center',
    borderRightWidth: 2,
    borderColor: '#5382AC',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#000',
  },
  rowValue: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#000',
  },
});

export default PolicyInfoScreen;