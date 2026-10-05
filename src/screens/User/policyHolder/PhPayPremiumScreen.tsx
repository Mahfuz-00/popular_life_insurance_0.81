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
  Platform,
} from 'react-native';
import moment from 'moment';

import Header from '../../../components/Header';
import { showPartialReceiptAlert } from '../../../components/PremiumReceipt';
import globalStyle from '../../../styles/globalStyle';
import BackgroundImage from '../../../assets/BackgroundImage.png';
import { Input } from '../../../components/input/Input';
import { FilledButton } from '../../../components/FilledButton';
import { BkashPayment } from '../../../components/payment/BkashPayment';
import { NagadPayment } from '../../../components/payment/NagadPayment';
import { DBBLPayment } from '../../../components/payment/DBBLPayment';

import {
  checkDatabaseConnection,
  getDuePremiumDetails,
  userPayPremiumSave,
} from '../../../actions/userActions';

import PaymentMethodSelector, {
  PaymentMethod,
} from '../../../components/PaymentMethodRadio';

import { useSelector, useDispatch } from 'react-redux';
import {
  SHOW_LOADING,
  HIDE_LOADING,
} from '../../../store/constants/commonConstants';

import EnglishOnlyInput from '../../../components/input/EnglishOnlyInput';

type PaymentType = 'full' | 'partial';

const PhPayPremiumScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const { user } = useSelector((state: any) => state.auth);

  const policyNo = route.params.policyNo;

  const [paymentType, setPaymentType] = useState<PaymentType>('full');
  const [amount, setAmount] = useState<string>('');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [adjustWith, setAdjustWith] = useState<string>('');
  const [cause, setCause] = useState<string>('');

  const [policyDetails, setPolicyDetails] = useState<any>(null);

  const [method, setMethod] = useState<
    'bkash' | 'nagad' | 'dbbl' | 'ssl'
  >('nagad');

  const [isEnabled, setIsEnabled] = useState(false);

  const [showBkash, setShowBkash] = useState(false);
  const [showNagad, setShowNagad] = useState(false);
  const [showDbbl, setShowDbbl] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [secondaryPaymentId, setSecondaryPaymentId] = useState<number | null>(
    null,
  );

  const amountToPay =
    paymentType === 'partial' ? partialAmount : amount;

  const maxPartialAllowed = policyDetails
    ? Math.floor(Number(policyDetails.DuePerInstalMent || 0) * 0.5)
    : 0;

  /**
   * Fetch policy details
   */
  useEffect(() => {
    const fetchData = async () => {
      dispatch({
        type: SHOW_LOADING,
        payload: 'Fetching policy details...',
      });

      try {
        const response = await getDuePremiumDetails(policyNo);

        console.log('Due Premium Details Response:', response);

        if (response) {
          setPolicyDetails(response);

          // Set full-payment amount from due amount
          if (response.DueAmount !== undefined && response.DueAmount !== null) {
            setAmount(String(response.DueAmount));
          }
        } else {
          Alert.alert('Error', 'Could not load policy details.');
        }
      } catch (error) {
        console.error('Failed to fetch due premium details:', error);

        Alert.alert(
          'Error',
          'Failed to fetch policy details. Please try again.',
        );
      } finally {
        dispatch({ type: HIDE_LOADING });
      }
    };

    fetchData();
  }, [policyNo, dispatch]);

  /**
   * Clear fields when payment type changes
   */
  useEffect(() => {
    if (paymentType === 'full') {
      setPartialAmount('');
      setAdjustWith('');
      setCause('');
    } else {
      setAmount('');
    }
  }, [paymentType]);

  /**
   * Normalize maturity value because API may return:
   * true / 1 / "1" / "true"
   */
  const isMatured = !!(
    policyDetails?.isMaturity === true ||
    policyDetails?.isMaturity === 1 ||
    policyDetails?.isMaturity === '1' ||
    policyDetails?.isMaturity === 'true'
  );

  /**
   * Submit payment
   */
  const handleSubmit = async () => {
    if (isSubmitting) return;

    console.log('Submitting payment with details:', {
      policyDetails,
      paymentType,
      amountToPay,
      partialAmount,
      adjustWith,
      cause,
      method,
      isEnabled,
    });

    if (!isEnabled) {
      if (Platform.OS === 'android') {
        return ToastAndroid.show(
          'Please agree to terms & conditions',
          ToastAndroid.LONG,
        );
      }

      return Alert.alert(
        'Alert',
        'Please agree to terms & conditions',
      );
    }

    if (!amountToPay || Number(amountToPay) <= 0) {
      if (Platform.OS === 'android') {
        return ToastAndroid.show(
          'Amount cannot be zero!',
          ToastAndroid.LONG,
        );
      }

      return Alert.alert('Alert', 'Amount cannot be zero!');
    }

    /**
     * Partial payment validation
     */
    if (paymentType === 'partial') {
      if (!partialAmount || !adjustWith || !cause.trim()) {
        if (Platform.OS === 'android') {
          return ToastAndroid.show(
            'Please fill all partial payment fields',
            ToastAndroid.LONG,
          );
        }

        return Alert.alert(
          'Alert',
          'Please fill all partial payment fields',
        );
      }

      if (Number(partialAmount) > maxPartialAllowed) {
        if (Platform.OS === 'android') {
          return ToastAndroid.show(
            `Max partial: ${maxPartialAllowed}`,
            ToastAndroid.LONG,
          );
        }

        return Alert.alert(
          'Alert',
          `Maximum partial amount allowed is ${maxPartialAllowed}`,
        );
      }
    }

    /**
     * Lapsed policy validation
     */
    if (policyDetails?.isLaps) {
      if (Platform.OS === 'android') {
        return ToastAndroid.show(
          'Policy is lapsed!',
          ToastAndroid.LONG,
        );
      }

      return Alert.alert(
        'Alert',
        'Policy is lapsed!',
      );
    }

    /**
     * Matured policy validation
     *
     * This normally cannot be reached because the payment UI is
     * hidden when isMatured === true. It is kept here as an
     * additional safety check.
     */
    if (isMatured) {
      if (Platform.OS === 'android') {
        return ToastAndroid.show(
          'Policy is matured!',
          ToastAndroid.LONG,
        );
      }

      return Alert.alert(
        'Alert',
        'Policy is matured!',
      );
    }

    /**
     * Full payment validation
     */
    if (paymentType === 'full') {
      const dueTotal = Number(policyDetails?.totalpremium || 0);
      const entered = Number(amountToPay);

      if (dueTotal <= 0) {
        if (Platform.OS === 'android') {
          return ToastAndroid.show(
            'Invalid premium amount',
            ToastAndroid.LONG,
          );
        }

        return Alert.alert(
          'Alert',
          'Invalid premium amount',
        );
      }

      if (entered % dueTotal !== 0) {
        if (Platform.OS === 'android') {
          return ToastAndroid.show(
            'Amount must be multiple of premium',
            ToastAndroid.LONG,
          );
        }

        return Alert.alert(
          'Alert',
          'Amount must be multiple of premium',
        );
      }

      const payingInstallments =
        Number(amountToPay || 0) /
        Number(policyDetails?.totalpremium || 0);

      const remainingInstallments =
        Number(policyDetails?.Diff_Ins || 0);

      if (payingInstallments > remainingInstallments) {
        const maximumAmount =
          Number(policyDetails?.totalpremium || 0) *
          remainingInstallments;

        if (Platform.OS === 'android') {
          return ToastAndroid.show(
            `You can pay maximum ${remainingInstallments} installments (${maximumAmount})`,
            ToastAndroid.LONG,
          );
        }

        return Alert.alert(
          'Alert',
          `You can pay maximum ${remainingInstallments} installments (${maximumAmount})`,
        );
      }
    }

    setIsSubmitting(true);

    dispatch({
      type: SHOW_LOADING,
      payload: `Preparing ${method.toUpperCase()} payment...`,
    });

    const isServerOk = await checkDatabaseConnection();

    if (!isServerOk) {
      dispatch({ type: HIDE_LOADING });
      setIsSubmitting(false);

      if (Platform.OS === 'android') {
        ToastAndroid.show(
          'Server is currently unavailable. Please try again later.',
          ToastAndroid.LONG,
        );
      } else {
        Alert.alert(
          'Alert',
          'Server is currently unavailable. Please try again later.',
        );
      }

      return;
    }

    /**
     * Sync to secondary server
     */
    const postData = {
      policy_no: policyNo,
      method: method,
      amount: amountToPay,
      transaction_no: null,
      project_name: policyDetails?.project_name || '',
      date_time: moment().format('DD-MM-YYYY HH:mm:ss'),
      partial_amount:
        paymentType === 'partial' ? partialAmount : null,
      adjust_with:
        paymentType === 'partial' ? adjustWith : null,
      cause:
        paymentType === 'partial' ? cause?.trim() : null,
      service_cell_code:
        policyDetails?.service_cell_code || '',
      branch_code:
        policyDetails?.branch_code || '',
      missing: false,
    };

    const saveResult = await userPayPremiumSave(postData);

    if (saveResult.success && saveResult.id) {
      setSecondaryPaymentId(saveResult.id);

      console.log(
        'Secondary payment ID:',
        saveResult.id,
      );
    } else {
      console.log('Secondary save failed');
    }

    try {
      if (method === 'bkash') {
        setShowBkash(true);
      }

      if (method === 'nagad') {
        setShowNagad(true);
      }

      if (method === 'dbbl') {
        setShowDbbl(true);
      }

      if (method === 'ssl') {
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            'SSL payment gateway is under maintenance.',
            ToastAndroid.LONG,
          );
        } else {
          Alert.alert(
            'Payment Method',
            'SSL Commerz is under maintenance.',
          );
        }
      }
    } catch (error) {
      console.error(
        'Payment initiation failed:',
        error,
      );

      if (Platform.OS === 'android') {
        ToastAndroid.show(
          'Failed to start payment process.',
          ToastAndroid.LONG,
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to start payment process.',
        );
      }
    } finally {
      dispatch({ type: HIDE_LOADING });

      if (method === 'ssl') {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Bkash Payment
   */
  if (showBkash) {
    return (
      <BkashPayment
        amount={amountToPay}
        number={policyNo}
        secondaryPaymentId={secondaryPaymentId}
        paymentType={paymentType}
        partialAmount={
          paymentType === 'partial'
            ? partialAmount
            : undefined
        }
        adjustWith={
          paymentType === 'partial'
            ? adjustWith
            : undefined
        }
        cause={
          paymentType === 'partial'
            ? cause
            : undefined
        }
        policyDetails={policyDetails}
        onSuccess={(trxID) => {
          setIsSubmitting(false);

          console.log(
            'Bkash Payment Successful, TrxID:',
            trxID,
          );

          console.log(
            'Payment Type:',
            paymentType,
          );

          if (paymentType === 'partial') {
            showPartialReceiptAlert(trxID);
          }

          navigation.pop();
        }}
        onClose={() => {
          setIsSubmitting(false);
          setShowBkash(false);
        }}
      />
    );
  }

  /**
   * Nagad Payment
   */
  if (showNagad) {
    return (
      <NagadPayment
        amount={amountToPay}
        number={policyNo}
        mobileNo={user?.phone || ''}
        secondaryPaymentId={secondaryPaymentId}
        paymentType={paymentType}
        partialAmount={
          paymentType === 'partial'
            ? partialAmount
            : undefined
        }
        adjustWith={
          paymentType === 'partial'
            ? adjustWith
            : undefined
        }
        cause={
          paymentType === 'partial'
            ? cause
            : undefined
        }
        policyDetails={policyDetails}
        onSuccess={(trxID) => {
          setIsSubmitting(false);

          console.log(
            'Nagad Payment Successful, TrxID:',
            trxID,
          );

          console.log(
            'Payment Type:',
            paymentType,
          );

          if (paymentType === 'partial') {
            showPartialReceiptAlert(trxID);
          }

          navigation.pop();
        }}
        onClose={() => {
          setIsSubmitting(false);
          setShowNagad(false);
        }}
      />
    );
  }

  /**
   * DBBL Payment
   */
  if (showDbbl) {
    return (
      <DBBLPayment
        amount={amountToPay}
        number={policyNo}
        secondaryPaymentId={secondaryPaymentId}
        mobileNo={user?.phone || ''}
        paymentType={paymentType}
        partialAmount={
          paymentType === 'partial'
            ? partialAmount
            : undefined
        }
        adjustWith={
          paymentType === 'partial'
            ? adjustWith
            : undefined
        }
        cause={
          paymentType === 'partial'
            ? cause
            : undefined
        }
        policyDetails={policyDetails}
        onSuccess={(trxID) => {
          setIsSubmitting(false);

          console.log(
            'DBBL Payment Successful, TrxID:',
            trxID,
          );

          console.log(
            'Payment Type:',
            paymentType,
          );

          if (paymentType === 'partial') {
            showPartialReceiptAlert(trxID);
          }

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
      <ImageBackground
        source={BackgroundImage}
        style={{ flex: 1 }}
      >
        <Header
          navigation={navigation}
          title="Pay Premium"
        />

        <ScrollView>
          <View style={globalStyle.wrapper}>
            {policyDetails ? (
              <>
                {/* Policy Details Table */}
                <View style={styles.table}>
                  <View style={styles.rowWrapper}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Policy No
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {policyNo}
                    </Text>
                  </View>

                  <View style={styles.rowWrapper}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Due Date
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {policyDetails.NextDueDate?.format3 || '—'}
                    </Text>
                  </View>

                  <View style={styles.rowWrapper}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Maturity Date
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {policyDetails.MaturityDate?.format3 || '—'}
                    </Text>
                  </View>

                  <View style={styles.rowWrapper}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Installment
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {policyDetails.NoofInstolment || '—'}
                    </Text>
                  </View>

                  <View style={styles.rowWrapper}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Instalment Expected
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {policyDetails.ins_expected || '—'}
                    </Text>
                  </View>

                  <View style={styles.rowWrapper}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Due Per Instalment
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {Number(
                        policyDetails.DuePerInstalMent || 0,
                      ).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.rowWrapper}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Total Premium
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {Number(
                        policyDetails.totalpremium || 0,
                      ).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.rowWrapper}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Due Amount
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {policyDetails.DueAmount ?? '—'}
                    </Text>
                  </View>

                  <View style={styles.rowWrapper}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Mode
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {policyDetails.mode || '—'}
                    </Text>
                  </View>

                  <View style={styles.rowWrapper}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Service Cell
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {policyDetails.service_cell_code || 0}
                    </Text>
                  </View>

                  <View style={styles.rowWrapperLast}>
                    <Text
                      style={[
                        styles.rowLable,
                        globalStyle.tableText,
                      ]}
                    >
                      Branch
                    </Text>

                    <Text
                      style={[
                        styles.rowValue,
                        globalStyle.tableText,
                      ]}
                    >
                      {policyDetails.branch_code || 0}
                    </Text>
                  </View>
                </View>

                {/* =====================================================
                    MATURED POLICY
                    Same banner style as PayPremiumScreen
                    ===================================================== */}
                {isMatured ? (
                  <View style={styles.maturedBanner}>
                    <Text style={styles.maturedTitle}>
                      Policy is Matured
                    </Text>

                    <Text style={styles.maturedSubtitle}>
                      {policyDetails.MaturityDate?.human ||
                        (policyDetails.MaturityDate?.original
                          ? moment(
                              policyDetails.MaturityDate.original,
                            ).fromNow()
                          : '')}
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Payment Type Toggle */}
                    <Text
                      style={[
                        globalStyle.fontMedium,
                        {
                          color: '#000',
                          marginTop: 15,
                          fontSize: 16,
                        },
                      ]}
                    >
                      Choose Payment Type
                    </Text>

                    <View style={styles.paymentTypeRow}>
                      {(['full', 'partial'] as const).map(
                        (type) => (
                          <TouchableOpacity
                            key={type}
                            onPress={() =>
                              setPaymentType(type)
                            }
                            style={styles.radioBtn}
                          >
                            <View
                              style={[
                                styles.radioOuter,
                                paymentType === type &&
                                  styles.radioActive,
                              ]}
                            >
                              {paymentType === type && (
                                <View
                                  style={styles.radioInner}
                                />
                              )}
                            </View>

                            <Text style={styles.radioLabel}>
                              {type === 'full'
                                ? 'Full Payment'
                                : 'Partial Payment'}
                            </Text>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>

                    {/* Amount Input */}
                    {paymentType === 'full' ? (
                      <Input
                        label="Amount"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                      />
                    ) : (
                      <>
                        <Input
                          label="Partial Amount"
                          value={partialAmount}
                          onChangeText={setPartialAmount}
                          keyboardType="numeric"
                        />

                        <Text
                          style={[
                            globalStyle.fontMedium,
                            { marginVertical: 10 },
                          ]}
                        >
                          Adjust With
                        </Text>

                        <View style={styles.adjustRow}>
                          {[
                            'SB',
                            'Age_Proof',
                            'Suspense',
                            'Others',
                            'F/E',
                            'O/E',
                            'ADAB',
                            'PDAB',
                          ].map((item) => (
                            <TouchableOpacity
                              key={item}
                              onPress={() =>
                                setAdjustWith(item)
                              }
                              style={styles.adjustBtn}
                            >
                              <View
                                style={[
                                  styles.radioOuter,
                                  adjustWith === item &&
                                    styles.radioActive,
                                ]}
                              >
                                {adjustWith === item && (
                                  <View
                                    style={styles.radioInner}
                                  />
                                )}
                              </View>

                              <Text
                                style={styles.adjustLabel}
                              >
                                {item === 'Age_Proof'
                                  ? 'Age Proof'
                                  : item}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <EnglishOnlyInput
                          label="Cause / Reason"
                          value={cause}
                          onChangeText={setCause}
                        />
                      </>
                    )}

                    {/* Gateway Selection */}
                    <Text
                      style={[
                        globalStyle.fontMedium,
                        {
                          color: '#000',
                          marginTop: 15,
                        },
                      ]}
                    >
                      Choose Payment Method
                    </Text>

                    <PaymentMethodSelector
                      selectedMethod={method}
                      onSelect={(m: PaymentMethod) =>
                        setMethod(m)
                      }
                    />

                    {/* Terms */}
                    <View style={styles.termsRow}>
                      <Switch
                        value={isEnabled}
                        onValueChange={setIsEnabled}
                      />

                      <Text
                        style={[
                          globalStyle.fontMedium,
                          { fontSize: 16 },
                        ]}
                      >
                        I Agree to the{' '}

                        <Text
                          style={{ color: 'green' }}
                          onPress={() =>
                            Linking.openURL(
                              'https://signup.sslcommerz.com/term-condition',
                            )
                          }
                        >
                          Terms & Conditions
                        </Text>
                      </Text>
                    </View>

                    {/* Pay Button */}
                    <FilledButton
                      title={
                        isSubmitting
                          ? 'Processing...'
                          : `Pay ${Math.ceil(
                              Number(amountToPay || 0),
                            )}`
                      }
                      style={styles.payBtn}
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                    />
                  </>
                )}
              </>
            ) : (
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 50,
                  fontSize: 18,
                }}
              >
                Loading policy details...
              </Text>
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
    overflow: 'hidden',
  },

  rowWrapperLast: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    borderColor: '#5382AC',
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
    flex: 1,
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
    marginVertical: 10,
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
    fontFamily: 'FjallaOne-Regular',
  },

  /**
   * Same matured banner style as PayPremiumScreen
   */
  maturedBanner: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  maturedTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: globalStyle.fontMedium.fontFamily,
    marginBottom: 6,
    fontWeight: '600',
  },

  maturedSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.95,
  },
});

export default PhPayPremiumScreen;
