import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import globalStyle from '../styles/globalStyle';
import { PRIMARY_BUTTON_BG } from '../store/constants/colorConstants';
import Header from '../components/Header';
import { getOfficeInfo } from '../actions/commonServiceAction';

type RootStackParamList = {
  OfficeType: undefined;
  OfficeList: { type: 'corporate' | 'divisinal' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Main exported screen — acts as navigator
const CompanyInfoScreen: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OfficeType" component={OfficeTypeScreen} />
      <Stack.Screen name="OfficeList" component={OfficeListScreen} />
    </Stack.Navigator>
  );
};

// First screen: Choose office type
type OfficeTypeScreenProps = NativeStackScreenProps<RootStackParamList, 'OfficeType'>;

const OfficeTypeScreen: React.FC<OfficeTypeScreenProps> = ({ navigation }) => {
  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} title="Company Information" />
      <ScrollView style={globalStyle.wrapper}>
        <TouchableOpacity
          onPress={() => navigation.navigate('OfficeList', { type: 'corporate' })}
          style={styles.button}
        >
          <Text style={[globalStyle.fontMedium, styles.buttonText]}>
            Corporate Office
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('OfficeList', { type: 'divisinal' })}
          style={styles.button}
        >
          <Text style={[globalStyle.fontMedium, styles.buttonText]}>
            Divisional Offices
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Second screen: Show list of offices
type OfficeListScreenProps = NativeStackScreenProps<RootStackParamList, 'OfficeList'>;

interface Office {
  name: string;
  address: string;
}

const OfficeListScreen: React.FC<OfficeListScreenProps> = ({ navigation, route }) => {
  const { type } = route.params;
  const [offices, setOffices] = useState<Office[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getOfficeInfo(type);
        setOffices(response || []);
      } catch (error) {
        console.error('Failed to fetch offices:', error);
        setOffices([]);
      }
    };

    fetchData();
  }, [type]);

  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} title="Company Information" />
      <ScrollView style={globalStyle.wrapper}>
        <View style={{
          borderTopWidth: 2,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderColor: '#5382AC',
          marginVertical: 15,
        }}>
          {offices.length === 0 ? (
            <Text style={[globalStyle.fontMedium, { textAlign: 'center', padding: 20, color: '#666' }]}>
              No offices found
            </Text>
          ) : (
            offices.map((office, index) => (
              <View style={styles.rowWrapper} key={index}>
                <Text style={styles.rowLabel}>{office.name}</Text>
                <Text style={styles.rowValue}>{office.address}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    padding: 15,
    width: '100%',
    height: 100,
    backgroundColor: PRIMARY_BUTTON_BG,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    marginHorizontal: 15,
  },
  rowWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 2,
    borderColor: '#5382AC',
    alignItems: 'center',
  },
  rowLabel: {
    flex: 1,
    textAlign: 'center',
    borderColor: '#5382AC',
    paddingVertical: 10,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#000',
    backgroundColor: '#F0F8FF',
  },
  rowValue: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#000',
  },
});

export default CompanyInfoScreen;