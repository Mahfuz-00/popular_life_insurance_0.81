import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Alert, 
} from 'react-native';
import moment from 'moment';
import { useDispatch } from 'react-redux'; 

import globalStyle from '../../styles/globalStyle';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { DatePickerComponent } from '../../components/DatePickerComponent';
import { PickerComponent } from '../../components/PickerComponent';
import Header from '../../components/Header';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { getPlanList, getTermList, getCalculatedPremium } from '../../actions/calculatePremiumActions';
import BottomModal from '../../components/BottomModal';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants'; 

type PremiumCalculatorScreenProps = {
  navigation: any;
};

interface Plan {
  label: string;
  value: string;
}

const PremiumCalculatorScreen: React.FC<PremiumCalculatorScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch(); 

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
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isFetchingData, setIsFetchingData] = useState(true);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!plan || !term || !mode || !sumAssured || Number(sumAssured) <= 0) {
      Alert.alert('Validation Required', 'Please fill in all fields (Plan, Term, Mode, and a valid Sum Assured) before submitting.');
      return;
    }

    setIsSubmitting(true); 
    dispatch({ type: SHOW_LOADING, payload: 'Calculating premium...' }); 

    const postData = {
      plan: plan,
      tarm: term,
      mode: mode,
      dob: moment(dateOfBirth).format('YYYY-MM-DD'),
      sumAssured: sumAssured,
    };
    console.log('Post Data for Premium Calculation:', postData);

    try {
      const calculatedPremium = await getCalculatedPremium(postData);
      console.log('Calculated Premium:', calculatedPremium);
      
      if (calculatedPremium) {
        setPremium(calculatedPremium);
        setIsVisible(true); 
      } else {
        Alert.alert('Calculation Failed', 'Could not calculate premium. Please check your inputs.');
      }
    } catch (error) {
      console.error('Error calculating premium:', error);
      Alert.alert('Error', 'An error occurred during premium calculation. Please try again.');
    } finally {
      setIsSubmitting(false); 
      dispatch({ type: HIDE_LOADING }); 
    }
  };

  const onCloseModal = () => {
    setIsVisible(false); 
  };

  // Calculate age from DOB
  useEffect(() => {
    const calculatedAge = moment().diff(dateOfBirth, 'years');
    setAge(calculatedAge.toString());
  }, [dateOfBirth]);

  // Load plans on mount
  useEffect(() => {
    async function fetchPlans() {
      dispatch({ type: SHOW_LOADING, payload: 'Loading product data...' }); 
      setIsFetchingData(true); 
      try {
        const response = await getPlanList();
        if (response) {
          setPlans(response);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        Alert.alert('Error', 'Failed to load product plans. Check your connection.');
      } finally {
        setIsFetchingData(false); 
        dispatch({ type: HIDE_LOADING }); 
      }
    }
    fetchPlans();
  }, [dispatch]); 

  // Load terms when plan changes
  useEffect(() => {
    async function fetchTerms() {
      if (plan) {
        dispatch({ type: SHOW_LOADING, payload: 'Loading terms...' }); 
        setIsFetchingData(true); 
        try {
          const response = await getTermList(plan);
          if (response) {
            setTerms(response);
          } else {
            setTerms([]);
          }
        } catch (error) {
          console.error('Failed to fetch terms:', error);
          Alert.alert('Error', 'Failed to load terms for the selected plan.');
          setTerms([]);
        } finally {
          setIsFetchingData(false); 
          dispatch({ type: HIDE_LOADING }); 
        }
      } else {
        setTerms([]);
      }
    }
    fetchTerms();
  }, [plan, dispatch]);

  const isDisabled = isSubmitting || isFetchingData;
  const buttonTitle = isSubmitting ? 'CALCULATING...' : 'SUBMIT';

  const renderContent = () => (
    <View>
      {/* ... Modal content remains the same */}
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
            onCloseModal(); 
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
            editable={!isDisabled} 
          />

          <PickerComponent
            items={plans}
            value={plan}
            setValue={setPlan}
            label={'Product / Plan'}
            placeholder={'Select one'}
            disabled={isDisabled} 
          />

          <PickerComponent
            items={terms}
            value={term}
            setValue={setTerm}
            label={'Term'}
            placeholder={'Select one'}
            disabled={isDisabled} 
          />

          <PickerComponent
            items={modes}
            value={mode}
            setValue={setMode}
            label={'Mode'}
            placeholder={'Select one'}
            disabled={isDisabled} 
          />

          <Input
            label={'Sum Assured'}
            placeholder={''}
            value={sumAssured}
            onChangeText={setSumAssured}
            keyboardType="numeric"
            editable={!isDisabled} 
          />

          <FilledButton
            title={buttonTitle} 
            style={styles.loginButton}
            onPress={handleSubmit}
            disabled={isDisabled} 
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