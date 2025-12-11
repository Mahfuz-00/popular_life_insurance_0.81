import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from 'react-native';

import Header from '../../components/Header';
import globalStyle from '../../styles/globalStyle';
import { FilledButton } from '../../components/FilledButton';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { DatePickerComponent } from '../../components/DatePickerComponent';

type EarningInfoScreenProps = {
  navigation: any;
};

const EarningInfoScreen: React.FC<EarningInfoScreenProps> = ({ navigation }) => {
  const [dateFrom, setDateFrom] = useState<Date>(new Date('2023-01-01'));
  const [dateTo, setDateTo] = useState<Date>(new Date('2023-02-01'));

  const handleSubmit = () => {
    // Your future API call will go here
    console.log('Date From:', dateFrom);
    console.log('Date To:', dateTo);
  };

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title={'Earning Info'} />

        <ScrollView>
          <View style={globalStyle.wrapper}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <DatePickerComponent
                date={dateFrom}
                setDate={setDateFrom}
                label={'Date From'}
                style={{ width: '48%' }}
              />

              <DatePickerComponent
                date={dateTo}
                setDate={setDateTo}
                label={'Date To'}
                style={{ width: '48%' }}
              />
            </View>

            <FilledButton
              title={'SUBMIT'}
              style={{
                width: '40%',
                borderRadius: 50,
                alignSelf: 'center',
                marginVertical: 10,
                backgroundColor: '#EE4E89',
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
                <Text style={[styles.rowLable, globalStyle.tableText]}>Month</Text>
                <Text style={[styles.rowLable, globalStyle.tableText]}>First Year</Text>
                <Text style={[styles.rowLable, globalStyle.tableText]}>Renewal</Text>
                <Text style={[styles.rowLable, globalStyle.tableText]}>Total</Text>
              </View>

              <View style={styles.rowWrapper}>
                <Text style={[styles.rowValue, globalStyle.tableText]}>Jan 23</Text>
                <Text style={[styles.rowValue, globalStyle.tableText]}>10000</Text>
                <Text style={[styles.rowValue, globalStyle.tableText]}>2000</Text>
                <Text style={[styles.rowValue, globalStyle.tableText]}>12000</Text>
              </View>

              <View style={styles.rowWrapper}>
                <Text style={[styles.rowValue, globalStyle.tableText]}>Feb 23</Text>
                <Text style={[styles.rowValue, globalStyle.tableText]}>5000</Text>
                <Text style={[styles.rowValue, globalStyle.tableText]}>1000</Text>
                <Text style={[styles.rowValue, globalStyle.tableText]}>6000</Text>
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
    fontFamily: globalStyle.fontBold.fontFamily,
  },
  rowValue: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
  },
});

export default EarningInfoScreen;