import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from 'react-native';

import globalStyle from '../../../styles/globalStyle';
import BackgroundImage from '../../../assets/BackgroundImage.png';
import Header from '../../../components/Header';
import { getPrListByUser } from '../../../actions/userActions';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/index'; 

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
  pramount: string | number;
  type: string;
  prdate: { format3: string };
}

const PhPRListScreen: React.FC<PhPRListScreenProps> = ({ navigation, route }) => {
  const { policyNo } = route.params;
  const dispatch = useDispatch<AppDispatch>(); // ← This fixes the error
  const [prList, setPrList] = useState<PRItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      const response = await dispatch(getPrListByUser(policyNo)); // ← dispatch the thunk
      console.log(response);
      if (response) {
        setPrList(response);
      }
    }
    fetchData();
  }, [dispatch, policyNo]);

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title={'PR List'} />
        <ScrollView>
          <View style={globalStyle.wrapper}>
            {prList.map((pr, index) => (
              <View
                key={index}
                style={{
                  borderTopWidth: 2,
                  borderLeftWidth: 2,
                  borderRightWidth: 2,
                  borderColor: '#5382AC',
                  marginVertical: 15,
                }}
              >
                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Policy No</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {policyNo}
                  </Text>
                </View>

                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>PR No</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {pr.prno}
                  </Text>
                </View>

                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>PR Amount</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {pr.pramount}
                  </Text>
                </View>

                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>PR Type</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {pr.type}
                  </Text>
                </View>

                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>PR Date</Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {pr.prdate.format3}
                  </Text>
                </View>
              </View>
            ))}
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
    borderRightWidth: 2,
    borderColor: '#5382AC',
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