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
  Linking,
  Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Image } from 'react-native';
import moment from 'moment';

import Header from '../../components/Header';
import globalStyle from '../../styles/globalStyle';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { BkashPayment } from '../../components/payment/BkashPayment';
import { NagadPayment } from '../../components/payment/NagadPayment';
import { DBBLPayment } from '../../components/payment/DBBLPayment';
import { checkDatabaseConnection, getDuePremiumDetails, userPayPremiumSave } from '../../actions/userActions';
import PaymentMethodSelector, { PaymentMethod } from '../../components/PaymentMethodRadio';
import { SHOW_LOADING, HIDE_LOADING } from '../../store/constants/commonConstants';


const PayPremiumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  const [policyNumber, setPolicyNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [policyDetails, setPolicyDetails] = useState<any>({});

  const [isEnabled, setIsEnabled] = useState(false);
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'dbbl' | 'ssl'>('nagad');

  const [showBkash, setShowBkash] = useState(false);
  const [showNagad, setShowNagad] = useState(false);
  const [showDbbl, setShowDbbl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondaryPaymentId, setSecondaryPaymentId] = useState<number | null>(null);

  const amountToPay = amount;

  const handleGetPolicyDetails = async () => {
    if (!policyNumber) {
      if (Platform.OS === 'android') {
        return ToastAndroid.show('Please enter Policy Number', ToastAndroid.LONG);
      } else {
        return Alert.alert('Alert', 'Please enter Policy Number');
      }
    }

    dispatch({ type: SHOW_LOADING, payload: `Fetching details for ${policyNumber}...` });

    try {
      const res = await getDuePremiumDetails(policyNumber);
      if (res?.Policyno) {
        setPolicyDetails(res);
        console.log('Policy Details:', res);
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
      if (Platform.OS === 'android') {
        return ToastAndroid.show('Please agree to Terms & Conditions', ToastAndroid.LONG);
      } else {
        return Alert.alert('Alert', 'Please agree to Terms & Conditions');
      }
    }

    if (policyDetails.isLaps) {
      if (Platform.OS === 'android') {
        return ToastAndroid.show('Policy is lapsed!', ToastAndroid.LONG);
      } else {
        return Alert.alert('Policy Lapsed', 'This policy is currently lapsed. Please contact support for assistance.');
      }
    }
    if (policyDetails.isMaturity) {
      if (Platform.OS === 'android') {
        return ToastAndroid.show('Policy is matured!', ToastAndroid.LONG);
      } else {
        return Alert.alert('Policy Matured', 'This policy has matured. Please contact support for assistance.');
      }
    }

    const payableAmount = amountToPay;
    if (!payableAmount || Number(payableAmount) <= 0) {
      if (Platform.OS === 'android') {
        return ToastAndroid.show('Amount cannot be zero', ToastAndroid.LONG);
      } else {
        return Alert.alert('Alert', 'Amount cannot be zero');
      }
    }

    if (Number(payableAmount) % Number(policyDetails.totalpremium) !== 0) {
      if (Platform.OS === 'android') {
        return ToastAndroid.show('Amount must be multiple of premium', ToastAndroid.LONG);
      } else {
        return Alert.alert('Alert', 'Amount must be multiple of premium');
      }
    }

    const payingInstallments = Number(payableAmount || 0) / Number(policyDetails.totalpremium || 0);
    const remainingInstallments = Number(policyDetails.Diff_Ins || 0);
    console.log('Diff ins:', policyDetails.Diff_Ins);
    console.log('Paying Installments:', payingInstallments);
    console.log('Remaining Installments:', remainingInstallments);

    if (payingInstallments > remainingInstallments) {
      if (Platform.OS === 'android') {
        return ToastAndroid.show(
          `You can pay maximum ${remainingInstallments} installments (${Number(policyDetails.totalpremium || 0) * remainingInstallments})`,
          ToastAndroid.LONG
        );
      } else {
        return Alert.alert(
          'Alert',
          `You can pay maximum ${remainingInstallments} installments (${Number(policyDetails.totalpremium || 0) * remainingInstallments})`
        );
      }
    }

    setIsSubmitting(true);
    dispatch({ type: SHOW_LOADING, payload: `Initiating ${method.toUpperCase()} payment...` });

    const isServerOk = await checkDatabaseConnection();

    if (!isServerOk) {
      dispatch({ type: HIDE_LOADING });
      setIsSubmitting(false);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Server is currently unavailable. Please try again later.', ToastAndroid.LONG);
      } else {
        Alert.alert('Alert', 'Server is currently unavailable. Please try again later.');
      }
      return;
    }

    // === NEW: Sync to secondary server ===
    const postData = {
      policy_no: policyNumber,
      method: method,
      amount: amountToPay,
      transaction_no: null,
      project_name: policyDetails?.project_name || '',
      date_time: moment().format('DD-MM-YYYY HH:mm:ss'),
      partial_amount: null,
      adjust_with: null,
      cause: null,
      service_cell_code: policyDetails?.service_cell_code || '',
      branch_code: policyDetails?.branch_code || '',
      missing: false,
    };

    // Try save first
    const saveResult = await userPayPremiumSave(postData);
    if (saveResult.success && saveResult.id) {
      setSecondaryPaymentId(saveResult.id);
      console.log('Secondary payment ID:', saveResult.id);
    } else {
      console.log('Secondary save failed');
    }

    try {
      if (method === 'bkash') {
        setShowBkash(true);
      } else if (method === 'nagad') {
        setShowNagad(true);
      } else if (method === 'dbbl') {
        setShowDbbl(true);
      } else if (method === 'ssl') {
        if (Platform.OS === 'android') {
          ToastAndroid.show('SSL payment gateway under maintenance.', ToastAndroid.LONG);
        } else {
          Alert.alert('Alert', 'SSL payment gateway is currently under maintenance. Please choose another method.');
        }
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to start payment process.', ToastAndroid.LONG);
      } else {
        Alert.alert('Error', 'Failed to start payment process.');
      }
    } finally {
      dispatch({ type: HIDE_LOADING });

      if (method === 'ssl') {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
    }
  }, [isAuthenticated, navigation]);

  // Bkash WebView
  if (showBkash) {
    return (
      <BkashPayment
        amount={amountToPay}
        number={policyNumber}
        secondaryPaymentId={secondaryPaymentId}
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
        number={policyNumber}
        secondaryPaymentId={secondaryPaymentId}
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

  // DBBL WebView
  if (showDbbl) {
    return (
      <DBBLPayment
        amount={amountToPay}
        number={policyNumber}
        secondaryPaymentId={secondaryPaymentId}
        mobileNo={user?.phone || ''}
        paymentType="full"
        policyDetails={policyDetails}
        onSuccess={() => {
          setIsSubmitting(false);
          navigation.pop();
        }}
        onClose={() => {
          setIsSubmitting(false);
          setShowDbbl(false);
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
              value={policyNumber}
              keyboardType='numeric'
              onChangeText={setPolicyNumber}
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
                  <Text style={[globalStyle.fontMedium, { fontSize: 16 }]}>
                    I Agree to the{' '}
                    <Text style={{ color: 'green' }} onPress={() => Linking.openURL('https://signup.sslcommerz.com/term-condition')}>
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