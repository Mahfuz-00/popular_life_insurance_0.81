import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';

import Header from '../../components/Header';
import globalStyle from '../../styles/globalStyle';
import BackgroundImage from '../../assets/BackgroundImage.png';
import { userPolicyPartialPaymentList } from '../../actions/userActions';
import { API } from '../../config';

type PhPolicyPartialTransactionsScreenProps = {
  navigation: any;
  route: {
    params: {
      policyNo: string;
    };
  };
};

interface Transaction {
  transaction_no: string;
  created_at: string;
  amount: string | number;
  method: string;
}

const PhPolicyPartialTransactionsScreen: React.FC<PhPolicyPartialTransactionsScreenProps> = ({
  navigation,
  route,
}) => {
  const { policyNo } = route.params;
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchData() {
      const postData = { policy_no: policyNo };
      const response = await userPolicyPartialPaymentList(postData);

      if (response?.data?.[policyNo]) {
        setTransactions(response.data[policyNo]);
      }
    }
    fetchData();
  }, [policyNo]);

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title={'My Transaction'} />

        <ScrollView>
          <View style={globalStyle.wrapper}>
            <View
              style={{
                borderTopWidth: 2,
                borderLeftWidth: 2,
                borderRightWidth: 2,
                borderColor: '#5382AC',
                marginVertical: 15,
              }}
            >
              {/* Header Row */}
              <View style={styles.rowWrapper}>
                <Text style={[styles.rowLable, globalStyle.tableText]}>Trns. No</Text>
                <Text style={[styles.rowLable, globalStyle.tableText]}>Pay Date</Text>
                <Text style={[styles.rowLable, globalStyle.tableText]}>Amount</Text>
                <Text style={[styles.rowLable, globalStyle.tableText]}>Method</Text>
                <Text style={[styles.rowLable, globalStyle.tableText]}>Receipt</Text>
              </View>

              {/* Data Rows */}
              {transactions.map((item, index) => (
                <View style={styles.rowWrapper} key={index}>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {item.transaction_no}
                  </Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {moment(item.created_at).format('YYYY-MM-DD')}
                  </Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {item.amount}
                  </Text>
                  <Text style={[styles.rowValue, globalStyle.tableText]}>
                    {item.method}
                  </Text>

                  {/* Fixed: TextStyle moved inside Text */}
                  <TouchableOpacity
                    style={styles.downloadCell}
                    onPress={() =>
                      Linking.openURL(`${API}/api/policy/short-pr-receipt/${item.transaction_no}`)
                    }
                  >
                    <Text style={globalStyle.tableText}>
                      <Icon name="download-outline" size={26} color="blue" />
                    </Text>
                  </TouchableOpacity>
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
  downloadCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
});

export default PhPolicyPartialTransactionsScreen;