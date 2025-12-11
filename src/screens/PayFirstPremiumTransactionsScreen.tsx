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

import Header from '../components/Header';
import globalStyle from '../styles/globalStyle';
import BackgroundImage from '../assets/BackgroundImage.png';
import { FilledButton } from '../components/FilledButton';
import { SHOW_LOADING, HIDE_LOADING } from '../store/constants/commonConstants';
import { fetchFirstPremiumTransactions, downloadFirstPremiumReceipt } from '../actions/userActions';


type Transaction = {
  Project_Name: string;
  transaction_no: string;
  method: string;
  Total_Premium: string;
  NID_NO: string;
};

const FirstPremiumTransactionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [nid, setNid] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactionHistory = async () => {
    if (!nid.trim()) {
      Alert.alert('Error', 'Please enter a valid NID.', [{ text: 'OK', style: 'cancel' }]);
      return;
    }

    try {
      dispatch({ type: SHOW_LOADING, payload: { textColor: '#000000' } });
     
        const result = await fetchFirstPremiumTransactions(nid);

        if (result.success) {
        setTransactions(result.data);
        if (result.data.length === 0) {
            Alert.alert('No Data', 'No transactions found for this NID.', [{ text: 'OK', style: 'cancel' }]);
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
      dispatch({ type: HIDE_LOADING });
    }
  };

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
              />
              <FilledButton
                title="Fetch Transactions"
                style={styles.fetchButton}
                onPress={fetchTransactionHistory}
              />
            </View>

            {/* Transaction Table */}
            {transactions.length > 0 && (
              <View style={styles.table}>
                <View style={styles.rowWrapper}>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Project Name</Text>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Trns. No</Text>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Method</Text>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Premium</Text>
                  <Text style={[styles.rowLable, globalStyle.tableText]}>Receipt</Text>
                </View>

                {transactions.map((item, index) => (
                  <View style={styles.rowWrapper} key={index}>
                    <Text style={[styles.rowValue, globalStyle.tableText]}>
                      {item.Project_Name}
                    </Text>
                    <Text style={[styles.rowValue, globalStyle.tableText]}>
                      {item.transaction_no}
                    </Text>
                    <Text style={[styles.rowValue, globalStyle.tableText]}>
                      {item.method}
                    </Text>
                    <Text style={[styles.rowValue, globalStyle.tableText]}>
                      {parseFloat(item.Total_Premium).toFixed(2)}
                    </Text>

                    {/* Fixed: TextStyle inside Text */}
                    <TouchableOpacity
                      style={styles.downloadCell}
                      onPress={() => downloadFirstPremiumReceipt(item.transaction_no, item.NID_NO)}
                    >
                      <Text style={globalStyle.tableText}>
                        <Icon name="download-outline" size={26} color="blue" />
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {transactions.length === 0 && nid.trim() !== '' && (
              <Text style={[globalStyle.fontMedium, { textAlign: 'center', marginTop: 50 }]}>
                No transactions found for this NID.
              </Text>
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