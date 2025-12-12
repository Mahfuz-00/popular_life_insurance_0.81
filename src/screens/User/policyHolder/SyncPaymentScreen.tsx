import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { userPayPremium } from '../../../actions/userActions';

type SyncPaymentScreenProps = {
  navigation: any;
};

interface Payment {
  transaction_no: string;
  policy_no: string;
  amount: string | number;
  method: string;
  date_time: string;
  [key: string]: any;
}

const SyncPaymentScreen: React.FC<SyncPaymentScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const [payments, setPayments] = useState<Payment[]>([]);

  const getSyncPayments = async () => {
    const syncPayments = JSON.parse((await AsyncStorage.getItem('syncPayments')) || '[]');
    setPayments(syncPayments);
  };

  const handleSync = async (payment: Payment) => {
    const isSuccess = await userPayPremium(payment);
    if (isSuccess) {
      const syncPayments = JSON.parse((await AsyncStorage.getItem('syncPayments')) || '[]');
      const updateSyncPayments = syncPayments.filter(
        (item: Payment) => item.transaction_no !== payment.transaction_no
      );

      await AsyncStorage.setItem('syncPayments', JSON.stringify(updateSyncPayments));
      await getSyncPayments();
    }
  };

  useEffect(() => {
    getSyncPayments();
    if (!isAuthenticated) {
      navigation.navigate('Login');
    }
  }, [isAuthenticated, navigation]);

  return (
    <View>
      {payments.map((payment, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            backgroundColor: 'gray',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, marginLeft: 5 }}>
            Tnx: {payment.transaction_no}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#EE4E89', paddingHorizontal: 16, paddingVertical: 8 }}
            onPress={() => handleSync(payment)}
          >
            <Text style={{ color: '#FFFFFF' }}>Sync</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default SyncPaymentScreen;