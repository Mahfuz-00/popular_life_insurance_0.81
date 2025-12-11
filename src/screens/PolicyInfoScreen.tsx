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

import BackgroundImage from '../assets/BackgroundImage.png';
import globalStyle from '../styles/globalStyle';
import Header from '../components/Header';
import { Input } from '../components/Input';
import { FilledButton } from '../components/FilledButton';
import { DatePickerComponent } from '../components/DatePickerComponent';
import { getPolicyDetails } from '../actions/policyServiceActions';
import type { AppDispatch } from '../store';

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

  const handleClear = () => {
    setPolicyDetails(null);
    setSentOtp('');
    setOtp('');
    setPolicyNumber('');
    setPhoneNo('');
    setDateOfBirth(new Date('1990-01-01'));
  };

  const handleSubmit = async () => {
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

    const res = await dispatch(getPolicyDetails(sentOtp ? postDataWithOtp : postDataWithoutOtp));

    if (!res.data) {
      Alert.alert('Invalid data');
      return;
    }

    if (res.data.code) {
      setSentOtp(res.data.code);
    }

    if (res.data.name) {
      setPolicyDetails({
        name: res.data.name,
        sumAssured: res.data.sumAssured,
        totalPremium: res.data.totalPremium,
        plan: res.data.plan,
        tarm: res.data.tarm,
        mode: res.data.mode,
      });
    }
  };

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
              labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
              editable={!sentOtp}
            />

            <DatePickerComponent
              date={dateOfBirth}
              setDate={setDateOfBirth}
              label={'Birth Date'}
              labelStyle={{ color: '#FFF' }}
              editable={!sentOtp}
            />

            <Input
              label={'Phone No.'}
              placeholder={''}
              value={phoneNo}
              onChangeText={setPhoneNo}
              labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
              editable={!sentOtp}
            />

            {sentOtp && (
              <Input
                label={'OTP'}
                placeholder={''}
                value={otp}
                onChangeText={setOtp}
                labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
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
                title={'Submit'}
                style={{
                  width: '40%',
                  borderRadius: 50,
                  alignSelf: 'center',
                  marginVertical: 10,
                  backgroundColor: '#EE4E89',
                }}
                onPress={handleSubmit}
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