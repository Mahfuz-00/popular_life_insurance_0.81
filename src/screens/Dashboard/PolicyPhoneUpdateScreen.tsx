import React, { useState } from 'react';
import {
  View,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import moment from 'moment';

import { useDispatch } from 'react-redux';
import globalStyle from '../../styles/globalStyle';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { DatePickerComponent } from '../../components/DatePickerComponent';
import Header from '../../components/Header';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { updatePolicyMobile } from '../../actions/policyServiceActions';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants'; 

type PolicyPhoneUpdateScreenProps = {
  navigation: any;
};

const PolicyPhoneUpdateScreen: React.FC<PolicyPhoneUpdateScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date('1990-01-01'));
  const [policyNo, setPolicyNo] = useState<string>('');
  const [phoneNo, setPhoneNo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const clearData = () => {
    setPolicyNo('');
    setDateOfBirth(new Date('1990-01-01'));
    setPhoneNo('');
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!policyNo || !phoneNo || dateOfBirth.toDateString() === new Date('1990-01-01').toDateString()) {
        Alert.alert("Validation Required", "Please ensure Policy No, Phone No, and Birth Date are entered.");
        return;
    }

    setIsSubmitting(true); 
    dispatch({ type: SHOW_LOADING, payload: 'Updating phone number...' }); 

    const postData = {
      policyNo: policyNo,
      mobileNo: phoneNo,
      dob: moment(dateOfBirth).format('YYYY-MM-DD'),
    };

    try {
        const res = await updatePolicyMobile(postData);

        if (res?.isSuccess) {
            Alert.alert("Success", "Policy mobile number updated successfully!");
            await clearData();
        } else {
            const errorMessage = res?.message || "Failed to update phone number. Please try again.";
            Alert.alert("Update Failed", errorMessage);
        }

    } catch (error) {
        console.error('Phone update failed:', error);
        Alert.alert("Connection Error", "A network error occurred. Please try again.");
    } finally {
        setIsSubmitting(false);
        dispatch({ type: HIDE_LOADING });
    }
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
            keyboardType='numeric'
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
            title={isSubmitting ? 'Submitting...' : 'Submit'}
            style={styles.loginButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
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