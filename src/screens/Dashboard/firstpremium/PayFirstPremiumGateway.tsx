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
  Linking,
  Alert,
  BackHandler,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { BkashPayment } from '../../../components/payment/BkashPayment';
import { NagadPayment } from '../../../components/payment/NagadPayment';
import Header from '../../../components/Header';
import globalStyle from '../../../styles/globalStyle';
import BackgroundImage from '../../../assets/BackgroundImage.png';
import { FilledButton } from '../../../components/FilledButton';
import PaymentMethodSelector from '../../../components/PaymentMethodRadio';
import { userPayFirstPremium, downloadFirstPremiumReceipt, checkDatabaseConnection, userPayFirstPremiumSave } from '../../../actions/userActions';
import { clearFirstPremiumData } from '../../../actions/payFirstPremiumActions'; // Assuming this path
import { SHOW_LOADING, HIDE_LOADING } from '../../../store/constants/commonConstants';
import { FirstPremiumBkashPayment } from '../../../components/payment/FirstPremiumBkashPayment';
import { FirstPremiumNagadPayment } from '../../../components/payment/FirstPremiumNagadPayment';

type PaymentMethod = 'bkash' | 'nagad' | 'ssl';

const PayFirstPremiumGateway: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const formData = useSelector((state: any) => state.payFirstPremium.formData);

  // If no data in Redux, go back
  useEffect(() => {
    if (!formData) {
      Alert.alert('Error', 'Payment data not found. Please try again.');
      navigation.goBack();
    }
  }, [formData, navigation]);

  if (!formData) {
    return null;
  }

  const {
    project,
    projectCode,
    code,
    nid,
    entrydate,
    name,
    mobile,
    plan,
    planlabel,
    age,
    term,
    mode,
    sumAssured,
    totalPremium,
    servicingCell,
    agentMobile,
    fa,
    um,
    bm,
    agm,
    rateCode,
    basePremium,
    commission,
    rate,
    netAmount,
    fatherHusbandName,
    motherName,
    address,
    district,
    gender,
    nominee1Name,
    nominee1Percent,
    nominee2Name,
    nominee2Percent,
    nominee3Name,
    nominee3Percent,
    feOeOption,
    feOeAmount,
    installments
  } = formData;

  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [isEnabled, setIsEnabled] = useState(false);
  const [showBkash, setShowBkash] = useState(false);
  const [showNagad, setShowNagad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableData = [
    { label: 'Project', value: project },
    { label: 'Project Code', value: projectCode },
    { label: 'NID', value: nid },
    { label: 'Date', value: entrydate },
    { label: 'Name', value: name },
    { label: 'Mobile No.', value: mobile },
    { label: 'Plan Code', value: plan },
    { label: 'Plan', value: planlabel },
    { label: 'Age', value: age },
    { label: 'Term', value: term },
    { label: 'Mode', value: mode },
    // ← Only show Installments row when mode is monthly
    ...(mode === 'mly' ? [{ label: 'Installments', value: installments || '-' }] : []),
    { label: 'Sum Assured', value: sumAssured },
    { label: 'F/E or O/E', value: feOeOption },
    { label: 'Rate Code', value: rateCode },
    { label: 'Rate', value: rate },
    { label: 'Base Premium', value: basePremium },
    { label: 'F/E or O/E Amount', value: feOeAmount },
    { label: 'Commission', value: commission },
    { label: 'Payment Amount', value: netAmount },
    { label: 'Total Premium', value: totalPremium },
    { label: 'Father/Husband Name', value: fatherHusbandName },
    { label: 'Mother Name', value: motherName },
    { label: 'Address', value: address },
    { label: 'District', value: district },
    { label: 'Gender', value: gender },
    { label: 'Nominee 1', value: nominee1Name },
    { label: 'Nominee 1 %', value: nominee1Percent },
    { label: 'Nominee 2', value: nominee2Name },
    { label: 'Nominee 2 %', value: nominee2Percent },
    { label: 'Nominee 3', value: nominee3Name },
    { label: 'Nominee 3 %', value: nominee3Percent },
    { label: 'Servicing Cell', value: servicingCell },
    { label: 'Agent Mobile', value: agentMobile },
    { label: 'FA', value: fa },
    { label: 'UM', value: um },
    { label: 'BM', value: bm },
    { label: 'AGM', value: agm },
  ];

  const handleSubmit = async () => {
    if (!isEnabled) {
      ToastAndroid.show('Please agree to terms', ToastAndroid.LONG);
      return;
    }

    setIsSubmitting(true);
    dispatch({ type: SHOW_LOADING, payload: 'Processing payment...' });
    dispatch({ type: HIDE_LOADING });

    const isServerOk = await checkDatabaseConnection();

    if (!isServerOk) {
      dispatch({ type: HIDE_LOADING });
      setIsSubmitting(false);
      ToastAndroid.show('Server is currently unavailable. Please try again later.', ToastAndroid.LONG);
      return;
    }

    // === NEW: Sync to secondary server ===
    const postData = {
      method: method,
      nid: nid,
      project: projectCode.toString(),
      code: code.toString(),
      name,
      mobile,
      totalPremium,
      servicingCell,
      fa,
      um: um || null,
      bm: bm || null,
      agm: agm || null,
      agentMobile,
      entrydate,
      plan,
      age,
      term,
      mode,
      sumAssured,
      commission: commission || '0',
      net_pay: netAmount || '0',
      father_or_husband_name: fatherHusbandName,
      mother_name: motherName,
      address,
      district,
      gender,
      nominee_1_name: nominee1Name,
      nominee_1_percentage: nominee1Percent,
      nominee_2_name: nominee2Name,
      nominee_2_percentage: nominee2Percent,
      nominee_3_name: nominee3Name,
      nominee_3_percentage: nominee3Percent,
      missing: false,
      F_E_O_E: feOeOption,
      No_Of_Ins: installments,
      Total_Paid: null,
    };

    // Try save first
    const saveResult = await userPayFirstPremiumSave(postData);
    if (!saveResult.success) {
      // Already shows toast in the function
      console.log('Secondary save failed, will try update');
    }

    if (method === 'bkash') setShowBkash(true);
    if (method === 'nagad') setShowNagad(true);
    if (method === 'ssl') {
      Alert.alert('Payment Method', 'SSL Commerz is under maintanence.');
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showBkash || showNagad) {
        setShowBkash(false);
        setShowNagad(false);
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [showBkash, showNagad]);

  // Bkash Payment Success
  if (showBkash) {
    return (
      <FirstPremiumBkashPayment
        amount={netAmount}
        nid={nid}
        proposalData={{
          nid,
          project: projectCode.toString(),
          code: code.toString(),
          name,
          entrydate,
          mobile,
          plan,
          age,
          term,
          mode,
          sumAssured,
          totalPremium,
          servicingCell,
          fa,
          um: um || null,
          bm: bm || null,
          agm: agm || null,
          agentMobile,
          commission: commission || '0',
          net_pay: netAmount || '0',
          father_or_husband_name: fatherHusbandName,
          mother_name: motherName,
          address,
          district,
          gender,
          nominee_1_name: nominee1Name,
          nominee_1_percentage: nominee1Percent,
          nominee_2_name: nominee2Name,
          nominee_2_percentage: nominee2Percent,
          nominee_3_name: nominee3Name,
          nominee_3_percentage: nominee3Percent,
          feOeOption,
          installments
        }}
        onSuccess={() => {
          dispatch(clearFirstPremiumData());
          navigation.pop();
        }}
        onClose={() => setShowBkash(false)}
        navigation={navigation}
      />
    );
  }

  // Nagad Payment Success
  if (showNagad) {
    return (
      <FirstPremiumNagadPayment
        amount={netAmount}
        nid={nid}
        mobileNo={mobile}
        proposalData={{
          nid,
          project: projectCode.toString(),
          code: code.toString(),
          name,
          entrydate,
          mobile,
          plan,
          age,
          term,
          mode,
          sumAssured,
          totalPremium,
          servicingCell,
          fa,
          um: um || null,
          bm: bm || null,
          agm: agm || null,
          agentMobile,
          commission: commission || '0',
          net_pay: netAmount || '0',
          father_or_husband_name: fatherHusbandName,
          mother_name: motherName,
          address,
          district,
          gender,
          nominee_1_name: nominee1Name,
          nominee_1_percentage: nominee1Percent,
          nominee_2_name: nominee2Name,
          nominee_2_percentage: nominee2Percent,
          nominee_3_name: nominee3Name,
          nominee_3_percentage: nominee3Percent,
          feOeOption,
          installments
        }}
        onSuccess={() => {
          dispatch(clearFirstPremiumData());
          navigation.pop();
        }}
        onClose={() => setShowNagad(false)}
        navigation={navigation}
      />
    );
  }

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title="Pay First Premium" />
        <ScrollView>
          <View style={globalStyle.wrapper}>
            {/* Data Table */}
            <View style={styles.table}>
              {tableData.map((item, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.label, globalStyle.tableText]}>{item.label}</Text>
                  <Text style={[styles.value, globalStyle.tableText]}>{item.value || '-'}</Text>
                </View>
              ))}
            </View>

            {/* Payment Method */}
            <Text style={[globalStyle.fontMedium, { color: '#000', marginTop: 15 }]}>
              Choose Payment Method
            </Text>

            <PaymentMethodSelector
              selectedMethod={method}
              onSelect={(m: PaymentMethod) => setMethod(m)}
              disabled={isSubmitting}
            />

            {/* Terms */}
            <View style={styles.termsRow}>
              <Switch value={isEnabled} onValueChange={setIsEnabled} />
              <Text style={[globalStyle.fontMedium, { color: '#000', marginLeft: 10 }]}>
                I Agree to the{' '}
                <Text style={{ color: 'green' }} onPress={() => Linking.openURL('https://signup.sslcommerz.com/term-condition')}>
                  Terms & Conditions
                </Text>
              </Text>
            </View>

            {/* Pay Button */}
            <FilledButton
              title={isSubmitting ? 'Processing...' : `Pay ${Math.ceil(Number(netAmount))}`}
              style={styles.payBtn}
              onPress={handleSubmit}
              disabled={isSubmitting}
            />
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
  row: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#5382AC',
  },
  label: {
    flex: 1,
    textAlign: 'center',
    borderRightWidth: 2,
    borderColor: '#5382AC',
    padding: 8,
    fontFamily: globalStyle.fontMedium.fontFamily,
  },
  value: {
    flex: 1,
    textAlign: 'center',
    padding: 8,
    fontFamily: globalStyle.fontMedium.fontFamily,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  payBtn: {
    width: '40%',
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 10,
  },
});

export default PayFirstPremiumGateway;