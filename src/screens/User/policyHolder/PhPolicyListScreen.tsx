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
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchData() {
      dispatch({ type: SHOW_LOADING, payload: 'Fetching your policy list...' });

      try {
        const response = await getPolicyListByUser();
        console.log('Policy List Response:', response);

        // API returns array directly
        const policyList: string[] = Array.isArray(response) ? response : [];

        // Read stored history safely
        let storedPolicies: string[] = [];
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) storedPolicies = parsed;
            else if (typeof parsed === 'string') storedPolicies = [parsed];
          }
        } catch (e) {
          console.warn('Failed to parse stored policies, resetting...', e);
          storedPolicies = [];
        }

        console.log('📦 Stored policy history:', storedPolicies);
        console.log('🌐 API policy list:', policyList);

        // Order UI: stored first (if exists), then remaining API
        const orderedPolicies = [
          ...storedPolicies.filter((p) => policyList.includes(p)),
          ...policyList.filter((p) => !storedPolicies.includes(p)),
        ];

        console.log('🖥 Final UI policy order:', orderedPolicies);

        setPolicies(orderedPolicies);

        if (orderedPolicies.length === 0) {
          Alert.alert('Info', 'No active policies were found. You can try again later.');
        }
      } catch (error) {
        console.error('Failed to fetch policy list:', error);
        Alert.alert('Connection Error', 'Unable to load your policy list. Please check your connection.');
      } finally {
        setLoading(false);
        dispatch({ type: HIDE_LOADING });
      }
    }

    fetchData();
  }, [dispatch]);



  const handlePolicyPress = async (policy: string) => {
    console.log('👉 Pressed policy:', policy);

    let storedPolicies: string[] = [];

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('Stored raw:', stored);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          storedPolicies = parsed;
        } else if (typeof parsed === 'string') {
          storedPolicies = [parsed]; 
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored policies, resetting...', e);
      storedPolicies = [];
    }

    console.log('📦 Before update:', storedPolicies);

    // Move pressed policy to top
    storedPolicies = storedPolicies.filter((p) => p !== policy);
    storedPolicies.unshift(policy);

    // Max 20
    if (storedPolicies.length > 20) {
      storedPolicies = storedPolicies.slice(0, 20);
    }

    console.log('📦 After update:', storedPolicies);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storedPolicies));

    // Update UI
    setPolicies((prev) => [
      policy,
      ...prev.filter((p) => p !== policy),
    ]);

    console.log('➡️ Navigating to DashboardPh:', policy);

    navigation.navigate('DashboardPh', { policyNo: policy }); 
  };




  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} title={'Policy List'} />

      <ScrollView style={globalStyle.wrapper}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 18, color: '#555' }}>
            Loading your policies...
          </Text>
        ) : policies.length > 0 ? (
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
            No active policies were found. Please try again later or contact support.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default PhPolicyListScreen;