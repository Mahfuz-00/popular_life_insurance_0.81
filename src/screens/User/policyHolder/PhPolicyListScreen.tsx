import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import globalStyle from '../../../styles/globalStyle';
import Header from '../../../components/Header';
import { PRIMARY_BUTTON_BG } from '../../../store/constants/colorConstants';
import { getPolicyListByUser } from '../../../actions/userActions';
import { useDispatch } from 'react-redux';
import { SHOW_LOADING, HIDE_LOADING } from '../../../store/constants/commonConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PhPolicyListScreenProps = {
  navigation: any;
};

const STORAGE_KEY = '@last_selected_policy';

const PhPolicyListScreen: React.FC<PhPolicyListScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [policies, setPolicies] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      dispatch({ type: SHOW_LOADING, payload: 'Fetching your policy list...' });

      try {
        const response = await getPolicyListByUser();
        console.log('Policy List Response:', response);

        let policyList: string[] = response || [];

        // Get last selected policy from AsyncStorage
        const lastSelectedPolicy = await AsyncStorage.getItem(STORAGE_KEY);

        if (lastSelectedPolicy && policyList.includes(lastSelectedPolicy)) {
          // Move last selected policy to top
          policyList = [
            lastSelectedPolicy,
            ...policyList.filter((p) => p !== lastSelectedPolicy),
          ];
        }

        setPolicies(policyList);

        if (policyList.length === 0) {
          Alert.alert('Info', 'No policies found for your account.');
        }
      } catch (error) {
        console.error('Failed to fetch policy list:', error);
        Alert.alert('Connection Error', 'Unable to load policy list. Please try again.');
      } finally {
        dispatch({ type: HIDE_LOADING });
      }
    }

    fetchData();
  }, [dispatch]);

  const handlePolicyPress = async (policy: string) => {
    // Save selected policy to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY, policy);

    // Move the selected policy to top immediately
    setPolicies((prevPolicies) => [
      policy,
      ...prevPolicies.filter((p) => p !== policy),
    ]);

    navigation.navigate('DashboardPh', { policyNo: policy });
  };

  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} title={'Policy List'} />

      <ScrollView style={globalStyle.wrapper}>
        {policies.length > 0 ? (
          policies.map((policy, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handlePolicyPress(policy)}
              style={{
                marginVertical: 15,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 50,
                padding: 15,
                width: '100%',
                height: 100,
                backgroundColor: PRIMARY_BUTTON_BG,
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: '#FFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={[globalStyle.fontFjallaOne, { color: '#FFF', fontSize: 24 }]}>
                  {index + 1}
                </Text>
              </View>
              <Text
                style={[
                  globalStyle.fontMedium,
                  { fontSize: 18, color: '#FFF', marginHorizontal: 15 },
                ]}
              >
                {policy}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 18, color: '#555' }}>
            No policies found under your account.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default PhPolicyListScreen;