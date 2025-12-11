import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../actions/userActions';

import globalStyle from '../../styles/globalStyle';
import MenuComponent from '../../components/MenuComponent';
import Header from '../../components/Header';
import { COMPANY_NAME } from '../../config';
import { AppDispatch } from '../../store/index';

const { width, height } = Dimensions.get('window');

type DashboardPhScreenProps = {
  navigation: any;
  route: {
    params: {
      policyNo: string;
    };
  };
};

const DashboardPhScreen: React.FC<DashboardPhScreenProps> = ({ navigation, route }) => {
  const { policyNo } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const menus = [
    {
      title: 'Policy Statement',
      navigateTo: 'PhPolicyStatement',
      icon: require('../../assets/icon-company-info.png'),
    },
    {
      title: 'Due Premium',
      navigateTo: 'PhDuePremium',
      icon: require('../../assets/icon-my-transaction.png'),
    },
    {
      title: 'Pay Premium',
      navigateTo: 'PhPayPremium',
      icon: require('../../assets/icon-premium-calc.png'),
    },
    {
      title: 'E-Receipt',
      navigateTo: 'PhPolicyTransactions',
      icon: require('../../assets/icon-premium-calc.png'),
    },
    {
      title: 'Claim Submission',
      navigateTo: 'PhClaimSubmission',
      icon: require('../../assets/icon-claim-submission.png'),
    },
    {
      title: 'Policy Ledger',
      navigateTo: 'PhPRList',
      icon: require('../../assets/icon-claim-submission.png'),
    },
    {
      title: 'Partial E-Receipt',
      navigateTo: 'PhPolicyPartialTransactions',
      icon: require('../../assets/icon-premium-calc.png'),
    },
  ];

  const logoutHandler = () => {
    dispatch(logout(navigation));
  };

  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} title={policyNo} />

      <ScrollView>
        <View style={globalStyle.wrapper}>
          <View
            style={{
              padding: 10,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {menus.map((item, index) => (
              <MenuComponent
                key={index}
                onPress={() =>
                  navigation.navigate(item.navigateTo, { policyNo: policyNo })
                }
                icon={item.icon}
                title={item.title}
              />
            ))}

            {/* Commented Play Store Update Button – kept exactly as you had it */}
            {/* <View style={styles.updateContainer}>
              <TouchableOpacity
                onPress={checkPlayStoreVersion}
                style={styles.updateButton}>
                <Image
                  source={require('../../assets/playstore.png')}
                  style={styles.playStoreIcon}
                />
              </TouchableOpacity>
              <Text style={styles.updateButtonText}>Check for Updates</Text>
            </View> */}

            <MenuComponent
              onPress={() => logoutHandler()}
              icon={require('../../assets/icon-premium-calc.png')}
              title={'Logout'}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  updateContainer: {
    alignItems: 'center',
    marginTop: 20,
    height: height * 0.12,
    width: '26%',
    borderColor: '#333',
    borderWidth: 1,
    marginBottom: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  updateButton: {
    backgroundColor: '#ffffff',
    marginVertical: 20,
    alignItems: 'center',
    height: height * 0.07,
    width: '32%',
    marginTop: 28,
  },
  playStoreIcon: {
    width: 50,
    height: 50,
  },
  updateButtonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});

export default DashboardPhScreen;