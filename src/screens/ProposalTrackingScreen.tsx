import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import RadioButtonRN from 'radio-buttons-react-native';

import Header from '../components/Header';
import globalStyle from '../styles/globalStyle';
import BackgroundImage from '../assets/BackgroundImage.png';
import { Input } from '../components/Input';
import { FilledButton } from '../components/FilledButton';
import { BUTTON_BG_PINK } from '../store/constants/colorConstants';

const numberOptions = [
  { label: 'Proposal No', value: false },
  { label: 'Policy No', value: true },
];

type ProposalTrackingScreenProps = {
  navigation: any;
};

const ProposalTrackingScreen: React.FC<ProposalTrackingScreenProps> = ({ navigation }) => {
  const [number, setNumber] = useState<string>('');
  const [inputOtp, setInputOtp] = useState<string>('');

  const handleSubmit = () => {
    // Your future API call will go here
    console.log('Tracking:', number, 'OTP:', inputOtp);
  };

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title={'Proposal Tracking'} />

        <ScrollView>
          <View style={globalStyle.wrapper}>
            <RadioButtonRN
              data={numberOptions}
              selectedBtn={(e: any) => console.log(e)}
              box={false}
              textStyle={{ color: '#FFF', fontFamily: globalStyle.fontMedium.fontFamily }}
              initial={1}
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
              onPress={handleSubmit}
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
              onPress={handleSubmit}
            />

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
                <Text style={[styles.rowLable, globalStyle.tableText]}>Name</Text>
                <Text style={[styles.rowValue, globalStyle.tableText]}>XXXXX</Text>
              </View>

              <View style={styles.rowWrapper}>
                <Text style={[styles.rowLable, globalStyle.tableText]}>Status</Text>
                <Text style={[styles.rowValue, globalStyle.tableText]}>Pending</Text>
              </View>
            </View>
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

export default ProposalTrackingScreen;