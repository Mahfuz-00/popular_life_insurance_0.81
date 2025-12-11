// src/screens/policyHolder/PhPayPremiumScreen.tsx

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
  Linking 
} from 'react-native';
import RadioButtonRN from 'radio-buttons-react-native';
import { Image } from 'react-native';
import { useSelector } from 'react-redux';

import Header from '../../components/Header';
import { showPartialReceiptAlert } from '../../components/PremiumReceipt';
import globalStyle from '../../styles/globalStyle';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { Input } from '../../components/Input';
import { FilledButton } from '../../components/FilledButton';
import { BkashPayment } from '../../components/payment/BkashPayment';
import { NagadPayment } from '../../components/payment/NagadPayment';
import { getDuePremiumDetails } from '../../actions/userActions';
import PaymentMethodSelector, { PaymentMethod } from '../../components/PaymentMethodRadio';

type PaymentType = 'full' | 'partial';

const PhPayPremiumScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { user } = useSelector((state: any) => state.auth);
  const gatewayOptions = [
  { label: <Image source={require('../../assets/nagad.png')} style={styles.gatewayImg} />, value: 'nagad' },
  { label: <Image source={require('../../assets/bkash.png')} style={styles.gatewayImg} />, value: 'bkash' },
  { label: <Image source={require('../../assets/otherCards.png')} style={styles.gatewayImg} />, value: 'ssl' },
];


  const policyNo = route.params.policyNo;

  const [paymentType, setPaymentType] = useState<PaymentType>('full');
  const [amount, setAmount] = useState<string>('');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [adjustWith, setAdjustWith] = useState<string>('');
  const [cause, setCause] = useState<string>('');

  const [policyDetails, setPolicyDetails] = useState<any>(null);
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'ssl'>('bkash');
  const [isEnabled, setIsEnabled] = useState(false);

  const [showBkash, setShowBkash] = useState(false);
  const [showNagad, setShowNagad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const amountToPay = paymentType === 'partial' ? partialAmount : amount;
  const maxPartialAllowed = policyDetails ? Math.floor(policyDetails.DuePerInstalMent * 0.5) : 0;

  useEffect(() => {
    const fetchData = async () => {
      const response = await getDuePremiumDetails(policyNo);
      if (response) setPolicyDetails(response);
    };
    fetchData();
  }, [policyNo]);

  useEffect(() => {
    if (paymentType === 'full') {
      setPartialAmount('');
      setAdjustWith('');
      setCause('');
    } else {
      setAmount('');
    }
  }, [paymentType]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!isEnabled) return ToastAndroid.show('Please agree to terms & conditions', ToastAndroid.LONG);
    if (!amountToPay || Number(amountToPay) <= 0) return ToastAndroid.show('Amount cannot be zero!', ToastAndroid.LONG);

    if (paymentType === 'partial') {
      if (!partialAmount || !adjustWith || !cause.trim())
        return ToastAndroid.show('Please fill all partial payment fields', ToastAndroid.LONG);
      if (Number(partialAmount) > maxPartialAllowed)
        return ToastAndroid.show(`Max partial: ${maxPartialAllowed}`, ToastAndroid.LONG);
      if (Number(partialAmount) > Number(policyDetails?.DueAmount))
        return ToastAndroid.show('Partial amount cannot exceed total due', ToastAndroid.LONG);
    }

    if (policyDetails.isLaps) return ToastAndroid.show('Policy is lapsed!', ToastAndroid.LONG);
    if (policyDetails.isMaturity) return ToastAndroid.show('Policy is matured!', ToastAndroid.LONG);
    if (Number(amountToPay) % Number(policyDetails.totalpremium) !== 0)
      return ToastAndroid.show('Amount must be multiple of premium', ToastAndroid.LONG);

    setIsSubmitting(true);

    try {
        if (method === 'bkash') setShowBkash(true);
        if (method === 'nagad') setShowNagad(true);
    } finally {
        // optionally, you may want to reset it in onClose or onSuccess instead
        setIsSubmitting(false);
    }
  };

  // Bkash Payment
  if (showBkash) {
    return (
      <BkashPayment
        amount={amountToPay}
        number={policyNo}
        paymentType={paymentType}
        partialAmount={paymentType === 'partial' ? partialAmount : undefined}
        adjustWith={paymentType === 'partial' ? adjustWith : undefined}
        cause={paymentType === 'partial' ? cause : undefined}
        policyDetails={policyDetails}
        onSuccess={(trxID) => {
          if (paymentType === 'partial') {
            showPartialReceiptAlert(trxID); 
          }
          navigation.pop();
        }}
        onClose={() => setShowBkash(false)}
      />
    );
  }

  // Nagad Payment
  if (showNagad) {
    return (
      <NagadPayment
        amount={amountToPay}
        number={policyNo}
        mobileNo={user?.phone || ''}
        paymentType={paymentType}
        partialAmount={paymentType === 'partial' ? partialAmount : undefined}
        adjustWith={paymentType === 'partial' ? adjustWith : undefined}
        cause={paymentType === 'partial' ? cause : undefined}
        policyDetails={policyDetails}
        onSuccess={(trxID) => {
          if (paymentType === 'partial') {
            showPartialReceiptAlert(trxID);
          }
          navigation.pop();
        }}
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
            {policyDetails ? (
              <>
                {/* Policy Details Table */}
                <View style={styles.table}>
                  <View style={styles.rowWrapper}>
                    <Text style={[styles.rowLable, globalStyle.tableText]}>Policy No</Text>
                    <Text style={[styles.rowValue, globalStyle.tableText]}>{policyNo}</Text>
                  </View>
                  {/* ... all your rows ... */}
                  <View style={styles.rowWrapper}>
                    <Text style={[styles.rowLable, globalStyle.tableText]}>Due Amount</Text>
                    <Text style={[styles.rowValue, globalStyle.tableText]}>{policyDetails.DueAmount}</Text>
                  </View>
                </View>

                {/* Payment Type Toggle */}
                <Text style={[globalStyle.fontMedium, { color: '#000', marginTop: 15, fontSize: 16 }]}>
                  Choose Payment Type
                </Text>
                <View style={styles.paymentTypeRow}>
                  {(['full', 'partial'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setPaymentType(type)}
                      style={styles.radioBtn}
                    >
                      <View style={[styles.radioOuter, paymentType === type && styles.radioActive]}>
                        {paymentType === type && <View style={styles.radioInner} />}
                      </View>
                      <Text style={styles.radioLabel}>{type === 'full' ? 'Full Payment' : 'Partial Payment'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Amount Input */}
                {paymentType === 'full' ? (
                  <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
                ) : (
                  <>
                    <Input label="Partial Amount" value={partialAmount} onChangeText={setPartialAmount} keyboardType="numeric" />
                    <Text style={[globalStyle.fontMedium, { marginVertical: 10 }]}>Adjust With</Text>
                    <View style={styles.adjustRow}>
                      {['SB', 'Age_Proof', 'Suspense', 'Others', 'F/E', 'O/E', 'ADAB', 'PDAB'].map((item) => (
                        <TouchableOpacity
                          key={item}
                          onPress={() => setAdjustWith(item)}
                          style={styles.adjustBtn}
                        >
                          <View style={[styles.radioOuter, adjustWith === item && styles.radioActive]}>
                            {adjustWith === item && <View style={styles.radioInner} />}
                          </View>
                          <Text style={styles.adjustLabel}>{item === 'Age_Proof' ? 'Age Proof' : item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Input label="Cause / Reason" value={cause} onChangeText={setCause} />
                  </>
                )}

                {/* Gateway Selection */}
                <Text style={[globalStyle.fontMedium, { color: '#000', marginTop: 15 }]}>
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

                {/* Terms */}
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
                  title={`Pay ${Math.ceil(Number(amountToPay || 0))}`}
                  style={styles.payBtn}
                  onPress={handleSubmit}
                />
              </>
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 18 }}>Loading policy details...</Text>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    borderWidth: 2,
    borderColor: '#5382AC',
    marginVertical: 15,
  },
  rowWrapper: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#5382AC',
  },
  rowLable: {
    flex: 1,
    textAlign: 'center',
    borderRightWidth: 2,
    borderColor: '#5382AC',
    padding: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
  },
  rowValue: {
    flex:1,
    textAlign: 'center',
    padding: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
  },
  paymentTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0066CC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    backgroundColor: '#0066CC',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
  },
  radioLabel: {
    fontSize: 16,
    color: '#000',
    textTransform: 'capitalize',
  },
  adjustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  adjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginVertical: 8,
  },
  adjustLabel: {
    fontSize: 15,
    color: '#000',
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
  payBtn: {
    width: '40%',
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 10,
  },
});

export default PhPayPremiumScreen;