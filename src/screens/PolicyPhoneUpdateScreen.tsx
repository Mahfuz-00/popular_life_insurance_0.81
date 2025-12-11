import React, { useState } from 'react';
import {
  View,
  ImageBackground,
  ScrollView,
  StyleSheet,
} from 'react-native';
import moment from 'moment';

import globalStyle from '../styles/globalStyle';
import { Input } from '../components/Input';
import { FilledButton } from '../components/FilledButton';
import { DatePickerComponent } from '../components/DatePickerComponent';
import Header from '../components/Header';
import BackgroundImage from '../assets/BackgroundImage.png';
import { updatePolicyMobile } from '../actions/policyServiceActions';

type PolicyPhoneUpdateScreenProps = {
  navigation: any;
};

const PolicyPhoneUpdateScreen: React.FC<PolicyPhoneUpdateScreenProps> = ({ navigation }) => {
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date('1990-01-01'));
  const [policyNo, setPolicyNo] = useState<string>('');
  const [phoneNo, setPhoneNo] = useState<string>('');

  const handleSubmit = async () => {
    const postData = {
      policyNo: policyNo,
      mobileNo: phoneNo,
      dob: moment(dateOfBirth).format('YYYY-MM-DD'),
    };

    await updatePolicyMobile(postData);
    await clearData();
  };

  const clearData = async () => {
    setPolicyNo('');
    setDateOfBirth(new Date('1990-01-01'));
    setPhoneNo('');
  };

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title={'Policy Phone No Update'} />

        <ScrollView style={[globalStyle.wrapper, { margin: 10 }]}>
          <Input
            label={'Policy No'}
            placeholder={''}
            value={policyNo}
            onChangeText={setPolicyNo}
          />

          <DatePickerComponent
            date={dateOfBirth}
            setDate={setDateOfBirth}
            label={'Birth Date'}
          />

          <Input
            label={'Phone No'}
            placeholder={''}
            value={phoneNo}
            onChangeText={setPhoneNo}
            keyboardType="phone-pad"
          />

          <FilledButton
            title={'SUBMIT'}
            style={styles.loginButton}
            onPress={handleSubmit}
          />
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  loginButton: {
    marginVertical: 10,
  },
});

export default PolicyPhoneUpdateScreen;