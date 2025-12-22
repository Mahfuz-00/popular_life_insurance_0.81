import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import RadioButtonRN from 'radio-buttons-react-native';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import Header from '../../components/Header';
import globalStyle from '../../styles/globalStyle';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { BUTTON_BG_PINK } from '../../store/constants/colorConstants';
import { getPolicyDetails } from '../../actions/policyServiceActions';
import { AppDispatch } from '../../store/index';

const numberOptions = [
  { label: 'Proposal No', value: false },
  { label: 'Policy No', value: true },
];

type MyTransactionScreenProps = {
  navigation: any;
};

const MyTransactionScreen: React.FC<MyTransactionScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [number, setNumber] = useState('');
  const [isPolicy, setIsPolicy] = useState(true);
  const [inputOtp, setInputOtp] = useState('');
  const [policyDetails, setPolicyDetails] = useState<any>(null);

  const handleSubmit = async () => {
    if (isPolicy) {
      const res: any = await dispatch(getPolicyDetails(number));

      if (res) {
        setPolicyDetails({
          lastPayDate: res.data.lastPayDate.original,
          totalPaid: res.data.totalPaid,
        });
      }
    }
  };

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title={'My Transaction'} />

        <ScrollView>
          <View style={globalStyle.wrapper}>
            <RadioButtonRN
              data={numberOptions}
              selectedBtn={(e: any) => setIsPolicy(e.value)}
              box={false}
              textStyle={{ color: '#FFF', fontFamily: globalStyle.fontMedium.fontFamily }}
              initial={2}
            />

            <Input
              label={'Proposal or Policy Number'}
              placeholder={''}
              value={number}
              onChangeText={setNumber}
              labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
            />

            <FilledButton
              title={'Submit'}
              style={{
                width: '40%',
                borderRadius: 50,
                alignSelf: 'center',
                marginVertical: 10,
                backgroundColor: BUTTON_BG_PINK,
              }}
              onPress={() => {
                handleSubmit();
              }}
            />

            <Input
              label={'OTP'}
              placeholder={''}
              value={inputOtp}
              onChangeText={setInputOtp}
              labelStyle={[globalStyle.fontMedium, { color: '#FFF', marginTop: 15 }]}
            />

            <FilledButton
              title={'Verify'}
              style={{
                width: '40%',
                borderRadius: 50,
                alignSelf: 'center',
                marginVertical: 10,
                backgroundColor: BUTTON_BG_PINK,
              }}
              onPress={() => {
                handleSubmit();
              }}
            />

            {policyDetails && (
              <View
                style={{
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                  borderRightWidth: 2,
                  borderColor: '#5382AC',
                  marginVertical: 15,
                }}
              >
                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>
                    Last Pay Date
                  </Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {moment(policyDetails.lastPayDate).format('YYYY-MM-DD')}
                  </Text>
                </View>

                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>
                    Total Paid
                  </Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {policyDetails.totalPaid}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 2,
    borderColor: '#5382AC',
  },
  rowLable: {
    flex: 1,
    textAlign: 'center',
    borderColor: '#5382AC',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
  },
  rowValue: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
  },
});

export default MyTransactionScreen;