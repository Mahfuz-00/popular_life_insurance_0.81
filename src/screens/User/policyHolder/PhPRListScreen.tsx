import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/index'; 

import globalStyle from '../../../styles/globalStyle';
import BackgroundImage from '../../../assets/BackgroundImage.png';
import Header from '../../../components/Header';
import { getPrListByUser } from '../../../actions/userActions';

type PhPRListScreenProps = {
  navigation: any;
  route: {
    params: {
      policyNo: string;
    };
  };
};

interface PRItem {
  prno: string;
  prdate: { format3: string };
  pramount: string | number;
}

interface PRYearGroup {
  pr: PRItem[];
  total: string | number;
}

const PhPRListScreen: React.FC<PhPRListScreenProps> = ({ navigation, route }) => {
  const { policyNo } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const [prList, setPrList] = useState<Record<string, PRYearGroup>>({});

  useEffect(() => {
    async function fetchData() {
      const response = await dispatch(getPrListByUser(policyNo));
      if (response) {
        setPrList(response);
      }
    }
    fetchData();
  }, [dispatch, policyNo]);

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title={`PR List (${policyNo})`} />

        {/* Table Header */}
        <View style={styles.rowWrapper}>
          <Text style={[styles.rowLable, globalStyle.tableText]}>PR No</Text>
          <Text style={[styles.rowLable, globalStyle.tableText]}>PR Date</Text>
          <Text style={[styles.rowLable, globalStyle.tableText]}>Amount</Text>
        </View>

        <ScrollView>
          <View style={globalStyle.wrapper}>
            <View style={{ marginVertical: 8 }}>
              {Object.keys(prList).map((year, index) => (
                <View key={index}>
                  {/* Year Header */}
                  <View style={styles.rowWrapper}>
                    <Text style={[styles.rowLable, globalStyle.tableText]}>{year}</Text>
                    <Text style={[styles.rowLable, globalStyle.tableText]}></Text>
                    <Text style={[styles.rowLable, globalStyle.tableText]}></Text>
                  </View>

                  {/* PR Items */}
                  {prList[year].pr.map((prItem, idx) => (
                    <View style={styles.rowWrapper} key={idx}>
                      <Text style={[styles.rowValue, globalStyle.tableText]}>
                        {prItem.prno}
                      </Text>
                      <Text style={[styles.rowValue, globalStyle.tableText]}>
                        {prItem.prdate.format3}
                      </Text>
                      <Text style={[styles.rowValue, globalStyle.tableText]}>
                        {prItem.pramount}
                      </Text>
                    </View>
                  ))}

                  {/* Total Row */}
                  <View style={styles.rowWrapper}>
                    <Text style={[styles.rowLable, globalStyle.tableText]}></Text>
                    <Text style={[styles.rowLable, globalStyle.tableText]}></Text>
                    <Text style={[styles.rowLable, globalStyle.tableText, { borderTopWidth: 0.5 }]}>
                      {prList[year].total}
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={{ borderWidth: 0.5, marginHorizontal: 15, marginVertical: 8 }} />
                </View>
              ))}
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
  },
  rowLable: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#000',
  },
  rowValue: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#000',
  },
});

export default PhPRListScreen;