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
import RadioButtonRN from 'radio-buttons-react-native';
import { useSelector } from 'react-redux';
import { Image } from 'react-native';

import Header from '../components/Header';
import globalStyle from '../styles/globalStyle';
import BackgroundImage from '../assets/BackgroundImage.png';
import { Input } from '../components/Input';
import { FilledButton } from '../components/FilledButton';
import { BkashPayment } from '../components/payment/BkashPayment';
import { NagadPayment } from '../components/payment/NagadPayment';
import { getDuePremiumDetails } from '../actions/userActions';
import PaymentMethodSelector, { PaymentMethod } from '../components/PaymentMethodRadio';


type PaymentType = 'full' | 'partial';

const PayPremiumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

var gatewayOptions = [
  {
    label: (
      <Image
        source={require('../assets/bkash.png')}
        style={{ width: 80, height: 35 }}
      />
    ),
    value: 'BKASH',
  },
  {
    label: (
      <Image
        source={require('../assets/nagad.png')}
        style={{ width: 80, height: 35 }}
      />
    ),
    value: 'NAGAD',
  },
  {
    label: (
      <Image
        source={require('../assets/otherCards.png')}
        style={{ height: 35 }}
      />
    ),
    value: 'SSL',
  },
];

  const [number, setNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [policyDetails, setPolicyDetails] = useState<any>({});

  const [paymentType] = useState<PaymentType>('full'); // Change later if you add toggle
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [adjustWith, setAdjustWith] = useState<string>('');
  const [cause, setCause] = useState<string>('');

  const [isEnabled, setIsEnabled] = useState(false);
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'ssl'>('bkash');

  const [showBkash, setShowBkash] = useState(false);
  const [showNagad, setShowNagad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const handleGetPolicyDetails = async () => {
    const res = await getDuePremiumDetails(number);
    if (res?.Policyno) {
      setPolicyDetails(res);
    } else {
      Alert.alert('Policy not found');
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

    const payableAmount = paymentType === 'full' ? amount : partialAmount;
    if (!payableAmount || Number(payableAmount) <= 0) {
      return ToastAndroid.show('Amount cannot be zero', ToastAndroid.LONG);
    }

    if (Number(payableAmount) % Number(policyDetails.totalpremium) !== 0) {
      return ToastAndroid.show('Amount must be multiple of premium', ToastAndroid.LONG);
    }

    setIsSubmitting(true);

    try {
        if (method === 'bkash') setShowBkash(true);
        if (method === 'nagad') setShowNagad(true);
    } finally {
        // optionally, you may want to reset it in onClose or onSuccess instead
        setIsSubmitting(false);
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
        amount={paymentType === 'full' ? amount : partialAmount}
        number={number}
        paymentType={paymentType}
        partialAmount={paymentType === 'partial' ? partialAmount : undefined}
        adjustWith={paymentType === 'partial' ? adjustWith : undefined}
        cause={paymentType === 'partial' ? cause : undefined}
        policyDetails={policyDetails}
        onSuccess={() => navigation.pop()}
        onClose={() => setShowBkash(false)}
      />
    );
  }

  // Nagad WebView
  if (showNagad) {
    return (
      <NagadPayment
        amount={paymentType === 'full' ? amount : partialAmount}
        number={number}
        mobileNo={user?.phone || ''}
        paymentType={paymentType}
        partialAmount={paymentType === 'partial' ? partialAmount : undefined}
        adjustWith={paymentType === 'partial' ? adjustWith : undefined}
        cause={paymentType === 'partial' ? cause : undefined}
        policyDetails={policyDetails}
        onSuccess={() => navigation.pop()}
        onClose={() => setShowNagad(false)}
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
              onChangeText={setNumber}
              editable={Object.keys(policyDetails).length === 0}
              labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
            />

            {/* Next Button */}
            {Object.keys(policyDetails).length === 0 ? (
              <FilledButton title="Next" onPress={handleGetPolicyDetails} style={styles.btn} />
            ) : (
              <>
                {/* Policy Info */}
                <Input label="Name" value={policyDetails.name} editable={false} labelStyle={{ color: '#FFF' }} />

                {/* Amount Input */}
                <Input
                  label="Amount to Pay"
                  value={paymentType === 'full' ? amount : partialAmount}
                  onChangeText={paymentType === 'full' ? setPartialAmount : setAmount}
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

                {/* <RadioButtonRN
                  data={gatewayOptions}
                  selectedBtn={(e: any) => setMethod(e.value)}
                  initial={1}
                  boxActiveBgColor="#FFF"
                  textStyle={{ height: 60, textAlign: 'center', width: '100%' }}
                  boxStyle={{ height: 60, justifyContent: 'center' }}
                /> */}

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
                  title={`Pay ${Math.ceil(Number(paymentType === 'full' ? amount : partialAmount || 0))}`}
                  style={styles.btn}
                  onPress={handleSubmit}
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