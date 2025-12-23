import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';

import Header from '../../../components/Header';
import globalStyle from '../../../styles/globalStyle';
import BackgroundImage from '../../../assets/BackgroundImage.png';
import { FilledButton } from '../../../components/FilledButton';
import { SHOW_LOADING, HIDE_LOADING } from '../../../store/constants/commonConstants';
import { fetchFirstPremiumTransactions, downloadFirstPremiumReceipt } from '../../../actions/userActions';


type Transaction = {
  transaction_no: string;
  entrydate: string;
  Total_Premium: string;
  NID_NO: string;
};

const FirstPremiumTransactionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [nid, setNid] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactionHistory = async () => {
    if (isLoading) return;

    if (!nid.trim()) {
      Alert.alert('Error', 'Please enter a valid NID.', [{ text: 'OK', style: 'cancel' }]);
      return;
    }

    setIsLoading(true);
    setTransactions([]);
    dispatch({ type: SHOW_LOADING, payload: 'Fetching transaction history...' });

    try {
      // Assuming fetchFirstPremiumTransactions is a function that returns { success: boolean, data: Transaction[], message?: string }
      const result = await fetchFirstPremiumTransactions(nid);

      if (result.success) {
        console.log('Fetched Transactions:', result.data);
        setTransactions(result.data);
        if (result.data.length === 0) {
          // We keep the alert but let the rendering handle the "No Data" message
          // Alert.alert('No Data', 'No transactions found for this NID.', [{ text: 'OK', style: 'cancel' }]);
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch transactions', [{ text: 'OK', style: 'cancel' }]);
        setTransactions([]);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Server error',
        [{ text: 'OK', style: 'cancel' }]
      );
      setTransactions([]);
    } finally {
      setIsLoading(false);
      dispatch({ type: HIDE_LOADING });
    }
  };

  const shouldShowTable = transactions.length > 0 || (nid.trim() !== '' && !isLoading);

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title="Transaction History" />

        <ScrollView>
          <View style={globalStyle.wrapper}>
            {/* NID Input */}
            <View style={styles.inputContainer}>
              <Text style={[globalStyle.fontMedium, styles.label]}>Enter NID</Text>
              <TextInput
                style={styles.input}
                value={nid}
                onChangeText={setNid}
                placeholder="Enter NID"
                placeholderTextColor="#808080"
                keyboardType="numeric"
                editable={!isLoading}
              />
              <FilledButton
                title={isLoading ? "Processing..." : "Search"}
                style={styles.fetchButton}
                onPress={fetchTransactionHistory}
                disabled={isLoading}
              />
            </View>

            {shouldShowTable && (
              <View style={styles.table}>
                {/* Table Header Row (renders always when table container is visible) */}
                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Trns. No</Text>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Date</Text>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Premium</Text>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Receipt</Text>
                </View>

                {/* Data Rows */}
                {transactions.length > 0 ? (
                  transactions.map((item, index) => (
                    <View style={styles.rowWrapper} key={index}>
                      <Text style={[styles.rowValue, globalStyle.tableText]}>
                        {item.transaction_no}
                      </Text>
                      <Text style={[styles.rowValue, globalStyle.tableText]}>
                        {moment(item.entrydate).format('DD-MM-YYYY')}
                      </Text>
                      <Text style={[styles.rowValue, globalStyle.tableText]}>
                        {parseFloat(item.Total_Premium).toFixed(2)}
                      </Text>

                      <TouchableOpacity
                        style={styles.downloadCell}
                        // Assume downloadFirstPremiumReceipt handles the download asynchronously
                        onPress={() => downloadFirstPremiumReceipt(item.NID_NO, item.transaction_no)}
                      >
                        <Text style={globalStyle.tableText}>
                          <Icon name="download-outline" size={26} color="blue" />
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={[styles.rowWrapper, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.rowValue, { flex: 5, textAlign: 'center', paddingVertical: 15 }]}>
                      No transactions found for this NID.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  label: {
    color: '#000',
    marginBottom: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#5382AC',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#000',
    marginBottom: 15,
  },
  fetchButton: {
    width: '60%',
    borderRadius: 50,
    alignSelf: 'center',
  },
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
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontBold.fontFamily,
    color: '#000',
  },
  rowValue: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#000',
  },
  downloadCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default FirstPremiumTransactionsScreen;