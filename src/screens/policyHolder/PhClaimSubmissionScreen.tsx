import React, { useState, useEffect } from 'react';
import {
  View,
  ImageBackground,
  ScrollView,
  StyleSheet,
} from 'react-native';
import moment from 'moment';

import globalStyle from '../../styles/globalStyle';
import { DatePickerComponent } from '../../components/DatePickerComponent';
import { PickerComponent } from '../../components/PickerComponent';
import { Input } from '../../components/Input';
import { FilledButton } from '../../components/FilledButton';
import Header from '../../components/Header';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { createClaim } from '../../actions/userActions';
import { getClaimTypes } from '../../actions/commonServiceAction';

type PhClaimSubmissionScreenProps = {
  navigation: any;
  route: {
    params: {
      policyNo: string;
    };
  };
};

const PhClaimSubmissionScreen: React.FC<PhClaimSubmissionScreenProps> = ({ navigation, route }) => {
  const { policyNo } = route.params;

  const [proposerName] = useState('');
  const [phoneNo] = useState('');
  const [claimTypes, setClaimTypes] = useState<{ value: string; label: string }[]>([]);
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [dateOfIncident, setDateOfIncident] = useState<Date>(new Date('1990-01-01'));
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClear = () => {
    setType('');
    ('');
    setAmount     ('');
    setDateOfIncident(new Date('1990-01-01'));
    setRemarks    ('');
  };

  const handleSubmit = async () => {
    setErrors({});

    const postData = {
      policy_no: policyNo,
      type: type,
      amount: amount,
      incident_date: moment(dateOfIncident).format('YYYY-MM-DD'),
      remarks: remarks,
    };

    const res = await createClaim(postData);

    if (res.errors && res.isSuccess === false) {
      setErrors(res.errors);
    }

    if (res.isSuccess === true) {
      handleClear();
    }
  };

  useEffect(() => {
    async function fetchData() {
      const response = await getClaimTypes();
      if (response) {
        response.forEach((item: string) => {
          setClaimTypes((oldArray) => [...oldArray, { value: item, label: item }]);
        });
      }
    }

    fetchData();
  }, []);

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title="Online Claim" />
        <ScrollView style={[globalStyle.wrapper, { margin: 10 }]}>
          <Input
            label="Policy No"
            placeholder=""
            value={policyNo}
            editable={false}
          />

          <PickerComponent
            items={claimTypes}
            value={type}
            setValue={setType}
            label="Claim Type"
            placeholder="Select one"
            errors={errors}
            errorField="type"
          />

          <Input
            label="Claim Amount"
            placeholder=""
            value={amount}
            onChangeText={setAmount}
            errors={errors}
            errorField="amount"
          />

          <DatePickerComponent
            date={dateOfIncident}
            setDate={setDateOfIncident}
            label="Date of Incident"
          />

          <Input
            label="Remarks"
            placeholder=""
            value={remarks}
            onChangeText={setRemarks}
          />

          <FilledButton
            title="Submit Claim"
            style={styles.loginButton}
            onPress={() => {
              handleSubmit();
            }}
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

export default PhClaimSubmissionScreen;