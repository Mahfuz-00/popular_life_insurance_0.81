import React, { useState, useEffect } from 'react';
import {
  View,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  Alert
} from 'react-native';
import moment from 'moment';

import globalStyle from '../../../styles/globalStyle';
import { DatePickerComponent } from '../../../components/DatePickerComponent';
import { PickerComponent } from '../../../components/PickerComponent';
import { Input } from '../../../components/input/Input';
import { FilledButton } from '../../../components/FilledButton';
import Header from '../../../components/Header';
import BackgroundImage from '../../../assets/BackgroundImage.png';
import { createClaim } from '../../../actions/userActions';
import { getClaimTypes } from '../../../actions/commonServiceAction';
import EnglishOnlyInput from '../../../components/input/EnglishOnlyInput';
import { useDispatch } from 'react-redux';
import { SHOW_LOADING, HIDE_LOADING } from '../../../store/constants/commonConstants'; 

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
  const dispatch = useDispatch();

  const [proposerName] = useState('');
  const [phoneNo] = useState('');
  const [claimTypes, setClaimTypes] = useState<{ value: string; label: string }[]>([]);
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [dateOfIncident, setDateOfIncident] = useState<Date>(new Date('1990-01-01'));
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClear = () => {
    setType('');
    ('');
    setAmount     ('');
    setDateOfIncident(new Date('1990-01-01'));
    setRemarks    ('');
  };

const handleSubmit = async () => {
    if (isSubmitting) return; 
    
    if (!type || !amount || !remarks) {
        Alert.alert("Validation Error", "Please fill in all required fields (Type, Amount, Remarks).");
        return;
    }

    setErrors({});
    setIsSubmitting(true); 
    dispatch({ type: SHOW_LOADING, payload: 'Submitting claim...' });

    const postData = {
      policy_no: policyNo,
      type: type,
      amount: amount,
      incident_date: moment(dateOfIncident).format('YYYY-MM-DD'),
      remarks: remarks,
    };
    
    try {
        const res = await createClaim(postData);

        if (res.errors && res.isSuccess === false) {
          setErrors(res.errors);
          Alert.alert("Submission Failed", "Please correct the errors shown in the form.");
        } else if (res.isSuccess === true) {
          handleClear();
          Alert.alert("Success", "Your claim has been submitted successfully!");
        } else {
            Alert.alert("Submission Failed", "An unknown error occurred. Please try again.");
        }
    } catch (error) {
        console.error('Claim submission failed:', error);
        Alert.alert("Connection Error", "Failed to connect to the server. Please check your connection.");
    } finally {
        setIsSubmitting(false); 
        dispatch({ type: HIDE_LOADING });
    }
  };

  useEffect(() => {
    async function fetchData() {
      dispatch({ type: SHOW_LOADING, payload: 'Loading claim form data...' }); 
      
      try {
        const response = await getClaimTypes();
        if (response && Array.isArray(response)) {
          const formattedTypes = response.map((item: string) => ({ value: item, label: item }));
          setClaimTypes(formattedTypes);
        }
      } catch (error) {
        console.error('Failed to fetch claim types:', error);
        Alert.alert("Data Error", "Could not load claim types. Please try restarting the screen.");
      } finally {
        dispatch({ type: HIDE_LOADING }); 
      }
    }

    fetchData();
  }, [dispatch]);

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
            placeholder={'Select a claim type'} 
            errors={errors}
            errorField="type"
          />

          <Input
            label="Claim Amount"
            placeholder=""
            value={amount}
            onChangeText={setAmount}
            keyboardType='numeric'
            errors={errors}
            errorField="amount"
          />

          <DatePickerComponent
            date={dateOfIncident}
            setDate={setDateOfIncident}
            label="Date of Incident"
          />

          <EnglishOnlyInput
            label="Remarks"
            placeholder=""
            value={remarks}
            onChangeText={setRemarks}
          />

          <FilledButton
            title={isSubmitting ? 'Submitting...' : 'Submit Claim'}
            style={styles.loginButton}
            onPress={() => {
              handleSubmit();
            }}
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

export default PhClaimSubmissionScreen;