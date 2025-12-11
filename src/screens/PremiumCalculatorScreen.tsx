import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import moment from 'moment';

import globalStyle from '../styles/globalStyle';
import { Input } from '../components/Input';
import { FilledButton } from '../components/FilledButton';
import { DatePickerComponent } from '../components/DatePickerComponent';
import { PickerComponent } from '../components/PickerComponent';
import Header from '../components/Header';
import BackgroundImage from '../assets/BackgroundImage.png';
import { getPlanList, getTermList, getCalculatedPremium } from '../actions/calculatePremiumActions';
import BottomModal from '../components/BottomModal';

type PremiumCalculatorScreenProps = {
  navigation: any;
};

interface Plan {
  label: string;
  value: string;
}

const PremiumCalculatorScreen: React.FC<PremiumCalculatorScreenProps> = ({ navigation }) => {
  const modalRef = useRef<any>(null);

  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date('1990-01-01'));
  const [plans, setPlans] = useState<Plan[]>([]);
  const [terms, setTerms] = useState<Plan[]>([]);
  const [modes] = useState<Plan[]>([
    { label: 'Yearly', value: 'yly' },
    { label: 'Half Yearly', value: 'hly' },
    { label: 'Quarterly', value: 'qly' },
    { label: 'Monthly', value: 'mly' },
  ]);

  const [age, setAge] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [mode, setMode] = useState<string>('');
  const [sumAssured, setSumAssured] = useState<string>('');
  const [premium, setPremium] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = async () => {
    const postData = {
      plan: plan,
      tarm: term,
      mode: mode,
      dob: moment(dateOfBirth).format('YYYY-MM-DD'),
      sumAssured: sumAssured,
    };

    const calculatedPremium = await getCalculatedPremium(postData);
    setPremium(calculatedPremium);
    modalRef.current?.show();
  };

  const onCloseModal = () => {
    modalRef.current?.close();
  };

  // Calculate age from DOB
  useEffect(() => {
    const calculatedAge = moment().diff(dateOfBirth, 'years');
    setAge(calculatedAge.toString());
  }, [dateOfBirth]);

  // Load plans on mount
  useEffect(() => {
    async function fetchPlans() {
      const response = await getPlanList();
      if (response) {
        setPlans(response);
      }
    }
    fetchPlans();
  }, []);

  // Load terms when plan changes
  useEffect(() => {
    async function fetchTerms() {
      if (plan) {
        const response = await getTermList(plan);
        if (response) {
          setTerms(response);
        }
      } else {
        setTerms([]);
      }
    }
    fetchTerms();
  }, [plan]);

  const renderContent = () => (
    <View>
      <View style={{ flexDirection: 'row', marginVertical: 5 }}>
        <Text style={[globalStyle.fontMedium, { width: '48%', fontWeight: 'bold' }]}>
          Birth Date
        </Text>
        <Text style={[globalStyle.fontMedium, { width: '2%' }]}>:</Text>
        <Text style={[globalStyle.fontMedium, { width: '48%', marginLeft: 20 }]}>
          {moment(dateOfBirth).format('YYYY-MM-DD')}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', marginVertical: 5 }}>
        <Text style={[globalStyle.fontMedium, { width: '48%', fontWeight: 'bold' }]}>Term</Text>
        <Text style={[globalStyle.fontMedium, { width: '2%' }]}>:</Text>
        <Text style={[globalStyle.fontMedium, { width: '48%', marginLeft: 20 }]}>{term}</Text>
      </View>

      <View style={{ flexDirection: 'row', marginVertical: 5 }}>
        <Text style={[globalStyle.fontMedium, { width: '48%', fontWeight: 'bold' }]}>
          Sum Assured
        </Text>
        <Text style={[globalStyle.fontMedium, { width: '2%' }]}>:</Text>
        <Text style={[globalStyle.fontMedium, { width: '48%', marginLeft: 20 }]}>
          {sumAssured}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', marginVertical: 5 }}>
        <Text style={[globalStyle.fontMedium, { width: '48%', fontWeight: 'bold' }]}>Premium</Text>
        <Text style={[globalStyle.fontMedium, { width: '2%' }]}>:</Text>
        <Text style={[globalStyle.fontMedium, { width: '48%', marginLeft: 20 }]}>{premium}</Text>
      </View>

      <View style={{ flexDirection: 'row', marginVertical: 5 }}>
        <Text style={[globalStyle.fontMedium, { width: '48%', fontWeight: 'bold' }]}>Mode</Text>
        <Text style={[globalStyle.fontMedium, { width: '2%' }]}>:</Text>
        <Text style={[globalStyle.fontMedium, { width: '48%', marginLeft: 20 }]}>{mode}</Text>
      </View>

      <View style={{ flexDirection: 'row', marginVertical: 5, justifyContent: 'space-between' }}>
        <FilledButton
          title={'Apply'}
          style={{ width: '48%' }}
          onPress={() => {
            navigation.replace('ApplyOnline', {
              dateOfBirth: moment(dateOfBirth).format('YYYY-MM-DD'),
              age: age,
              plan: plan,
              term: term,
              sumAssured: sumAssured,
              premium: premium,
            });
          }}
        />

        <FilledButton
          title={'Cancel'}
          style={{ width: '48%' }}
          onPress={onCloseModal}
        />
      </View>
    </View>
  );

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title={'Premium Calculator'} />
        <ScrollView style={[globalStyle.wrapper, { margin: 10 }]}>
          <DatePickerComponent
            date={dateOfBirth}
            setDate={setDateOfBirth}
            label={'Birth Date'}
          />

          <PickerComponent
            items={plans}
            value={plan}
            setValue={setPlan}
            label={'Product / Plan'}
            placeholder={'Select one'}
          />

          <PickerComponent
            items={terms}
            value={term}
            setValue={setTerm}
            label={'Term'}
            placeholder={'Select one'}
          />

          <PickerComponent
            items={modes}
            value={mode}
            setValue={setMode}
            label={'Mode'}
            placeholder={'Select one'}
          />

          <Input
            label={'Sum Assured'}
            placeholder={''}
            value={sumAssured}
            onChangeText={setSumAssured}
            keyboardType="numeric"
          />

          <FilledButton
            title={'SUBMIT'}
            style={styles.loginButton}
            onPress={handleSubmit}
          />

          <BottomModal
            title="Premium Calculation"
            visible={isVisible}
            onClose={() => setIsVisible(false)}
            onTouchOutside={() => setIsVisible(false)}
            >
            {renderContent()}
          </BottomModal>
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

export default PremiumCalculatorScreen;