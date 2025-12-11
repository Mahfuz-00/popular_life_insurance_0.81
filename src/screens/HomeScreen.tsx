import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import globalStyle from '../styles/globalStyle';
import Header from '../components/Header';
import Slider from '../components/Slider';
import MenuComponent from '../components/MenuComponent';
import FooterContact from '../components/FooterContact';
import { COMPANY_NAME } from '../config';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.28;
const COLUMNS = 3;

interface MenuItem {
  title: string;
  navigateTo: string;
  icon: any;
}

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const navigateToDashboard = () => {
    if (user?.type === 'policy holder') {
      navigation.navigate('PhPolicyList');
    } else if (user?.type === 'agent') {
      navigation.navigate('DashboardProducer');
    }
  };

  const baseMenus: MenuItem[] = [
    { title: 'Pay Premium', navigateTo: 'PayPremium', icon: require('../assets/icon-online-payment.png') },
    { title: 'Premium Calculator', navigateTo: 'PremiumCalculator', icon: require('../assets/icon-premium-calc.png') },
    { title: 'Policy Information', navigateTo: isAuthenticated ? 'AuthPolicyInfo' : 'PolicyInfo', icon: require('../assets/icon-policy-info.png') },
    { title: 'Phone No Update', navigateTo: 'PolicyPhoneUpdate', icon: require('../assets/product-engine.png') },
    { title: 'Company Information', navigateTo: 'CompanyInfo', icon: require('../assets/icon-company-info.png') },
    { title: 'Our Product', navigateTo: 'ProductInfo', icon: require('../assets/product-engine.png') },
  ];

  const authMenus: MenuItem[] = isAuthenticated
    ? [
        { title: 'New Policy', navigateTo: 'PhPayFirstPremium', icon: require('../assets/pay-first-premiums-menu.jpg') },
        { title: 'Receipt Download', navigateTo: 'PayFirstPremiumTransaction', icon: require('../assets/icon-premium-calc.png') },
        { title: 'Business Report', navigateTo: 'CodeWiseCollectionScreen', icon: require('../assets/icon-claim-submission.png') },
      ]
    : [];

  const allMenus = [...baseMenus, ...authMenus];

  // Login / Dashboard button (always first)
  const loginMenu = isAuthenticated ? (
    <MenuComponent
      key="dashboard"
      onPress={navigateToDashboard}
      icon={require('../assets/icon-login.png')}
      title={user?.type === 'policy holder' ? 'Policy List' : 'Dashboard'}
    />
  ) : (
    <MenuComponent
      key="login"
      onPress={() => navigation.navigate('Login')}
      icon={require('../assets/icon-login.png')}
      title="Role base login"
    />
  );

  // My Account (only if authenticated)
  const myAccountMenu = isAuthenticated ? (
    <MenuComponent
      key="myaccount"
      onPress={() =>
        user?.type === 'policy holder'
          ? navigation.navigate('PhMyProfile')
          : navigation.navigate('OrgMyProfile')
      }
      icon={require('../assets/icon-my-transaction.png')}
      title="My Account"
    />
  ) : null;

  // Total items excluding My Account
  const totalItems = allMenus.length + 1; // +1 for login/dashboard
  const totalWithMyAccount = isAuthenticated ? totalItems + 1 : totalItems;
  const fullRows = Math.floor(totalItems / COLUMNS);
  const itemsInLastRow = totalItems % COLUMNS;

  // Decide My Account position
  const shouldMyAccountBeRight = isAuthenticated && itemsInLastRow !== 0;
  const placeholderCount = shouldMyAccountBeRight
    ? COLUMNS - (itemsInLastRow + 1) // +1 because My Account takes one spot
    : COLUMNS - itemsInLastRow;

  const menuItems = allMenus.map((item, index) => (
    <MenuComponent
      key={index}
      title={item.title}
      icon={item.icon}
      onPress={() => navigation.navigate(item.navigateTo)}
    />
  ));

  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Slider />

        <View style={globalStyle.wrapper}>
          <View style={styles.gridContainer}>
            {/* First: Login/Dashboard */}
            {loginMenu}

            {/* All dynamic menus */}
            {menuItems}

            {/* Fill last row with invisible placeholders if needed */}
            {isAuthenticated &&
              shouldMyAccountBeRight &&
              placeholderCount > 0 &&
              Array(placeholderCount)
                .fill(null)
                .map((_, i) => <View key={`placeholder-${i}`} style={styles.placeholder} />)}

            {/* My Account - placed correctly */}
            {myAccountMenu && (
              <View style={shouldMyAccountBeRight ? styles.myAccountRight : styles.myAccountLeft}>
                {myAccountMenu}
              </View>
            )}

            {/* If no items in last row and no My Account, just let it flow naturally */}
          </View>
        </View>
      </ScrollView>

      <FooterContact />
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  placeholder: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    margin: 8,
  },
  myAccountRight: {
    position: 'absolute',
    bottom: 8,
    right: 16,
  },
  myAccountLeft: {
    // Will naturally go to next row start if no other items
  },
});

export default HomeScreen;