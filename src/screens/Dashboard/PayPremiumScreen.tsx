import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Switch,
  TouchableOpacity,
  ToastAndroid,
  StyleSheet,
  Alert,
  Linking 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Image } from 'react-native';

import Header from '../../components/Header';
import globalStyle from '../../styles/globalStyle';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { BkashPayment } from '../../components/payment/BkashPayment';
import { NagadPayment } from '../../components/payment/NagadPayment';
import { getDuePremiumDetails } from '../../actions/userActions';
import PaymentMethodSelector, { PaymentMethod } from '../../components/PaymentMethodRadio';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants'; 


const PayPremiumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  const [number, setNumber] = useState<string>(''); 
  const [amount, setAmount] = useState<string>(''); 
  const [policyDetails, setPolicyDetails] = useState<any>({});

  const [isEnabled, setIsEnabled] = useState(false);
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'ssl'>('bkash');

  const [showBkash, setShowBkash] = useState(false);
  const [showNagad, setShowNagad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const amountToPay = amount; 

  const handleGetPolicyDetails = async () => {
    if (!number) return ToastAndroid.show('Please enter Policy Number', ToastAndroid.LONG);

    dispatch({ type: SHOW_LOADING, payload: `Fetching details for ${number}...` });
    
    try {
      const res = await getDuePremiumDetails(number);
      if (res?.Policyno) {
        setPolicyDetails(res);
        if (res.DueAmount) {
            setAmount(String(res.DueAmount));
        }
      } else {
        setPolicyDetails({});
        setAmount(''); 
        Alert.alert('Policy Not Found', 'No policy details could be retrieved for this number.');
      }
    } catch (error) {
        console.error('Failed to fetch details:', error);
        Alert.alert('Error', 'Failed to fetch policy details. Please try again.');
    } finally {
        dispatch({ type: HIDE_LOADING });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!isEnabled) {
      return ToastAndroid.show('Please agree to Terms & Conditions', ToastAndroid.LONG);
    }

    if (policyDetails.isLaps) {
      return ToastAndroid.show('Policy is lapsed!', ToastAndroid.LONG);
    }
    if (policyDetails.isMaturity) {
      return ToastAndroid.show('Policy is matured!', ToastAndroid.LONG);
    }

    const payableAmount = amountToPay;
    if (!payableAmount || Number(payableAmount) <= 0) {
      return ToastAndroid.show('Amount cannot be zero', ToastAndroid.LONG);
    }

    if (Number(payableAmount) % Number(policyDetails.totalpremium) !== 0) {
      return ToastAndroid.show('Amount must be multiple of premium', ToastAndroid.LONG);
    }

    setIsSubmitting(true);
    dispatch({ type: SHOW_LOADING, payload: `Initiating ${method.toUpperCase()} payment...` });

    try {
        if (method === 'bkash') {
            setShowBkash(true);
        } else if (method === 'nagad') {
            setShowNagad(true);
        } else if (method === 'ssl') {
            ToastAndroid.show('SSL payment gateway under maintenance.', ToastAndroid.LONG);
        }
    } catch (error) {
        console.error('Payment initiation failed:', error);
        ToastAndroid.show('Failed to start payment process.', ToastAndroid.LONG);
    } finally {
        dispatch({ type: HIDE_LOADING }); 
        
        if (method === 'ssl') {
           setIsSubmitting(false); 
        }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
    }
  }, [isAuthenticated, navigation]);

  // Bkash WebView
  if (showBkash) {
    return (
      <BkashPayment
        amount={amountToPay}
        number={number}
        paymentType="full" 
        policyDetails={policyDetails}
        onSuccess={() => {
            setIsSubmitting(false);
            navigation.pop();
        }}
        onClose={() => {
            setIsSubmitting(false);
            setShowBkash(false);
        }}
      />
    );
  }

  // Nagad WebView
  if (showNagad) {
    return (
      <NagadPayment
        amount={amountToPay}
        number={number}
        mobileNo={user?.phone || ''}
        paymentType="full" 
        policyDetails={policyDetails}
        onSuccess={() => {
            setIsSubmitting(false);
            navigation.pop();
        }}
        onClose={() => {
            setIsSubmitting(false);
            setShowNagad(false);
        }}
      />
    );
  }

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title="Pay Premium" />

        <ScrollView>
          <View style={globalStyle.wrapper}>
            {/* Policy Number Input */}
            <Input
              label="Proposal or Policy Number"
              value={number}
              keyboardType='numeric'
              onChangeText={setNumber}
              editable={Object.keys(policyDetails).length === 0}
              labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
            />

            {/* Next Button */}
            {Object.keys(policyDetails).length === 0 ? (
              <FilledButton 
                title="Next" 
                onPress={handleGetPolicyDetails} 
                style={styles.btn} 
              />
            ) : (
              <>
                {/* Policy Info */}
                <Input label="Name" value={policyDetails.name} editable={false} labelStyle={{ color: '#FFF' }} />

                {/* Amount Input */}
                <Input
                  label="Amount to Pay"
                  value={amount} 
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
                />

                {/* Payment Method */}
                <Text style={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}>
                  Choose Payment Method
                </Text>

                <PaymentMethodSelector
                    selectedMethod={method}
                    onSelect={(m: PaymentMethod) => setMethod(m)}
                />

                {/* Terms & Conditions */}
                <View style={styles.termsRow}>
                  <Switch value={isEnabled} onValueChange={setIsEnabled} />
                  <Text style={[globalStyle.fontMedium, { color: '#FFF', marginLeft: 10 }]}>
                    I Agree to the{' '}
                    <Text
                      style={{ color: 'green', textDecorationLine: 'underline' }}
                      onPress={() => Linking.openURL('https://signup.sslcommerz.com/term-condition')}
                    >
                      Terms & Conditions
                    </Text>
                  </Text>
                </View>

                {/* Pay Button */}
                <FilledButton
                  title={isSubmitting ? 'Processing...' : `Pay ${Math.ceil(Number(amountToPay || 0))}`}
                  style={styles.btn}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                />
              </>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: '40%',
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 10,
  },
  gatewayImg: {
    width: 80,
    height: 35,
    resizeMode: 'contain',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
});

export default PayPremiumScreen;