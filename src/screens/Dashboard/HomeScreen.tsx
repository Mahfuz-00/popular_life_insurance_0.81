import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Image, StatusBar, Text } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import globalStyle from '../../styles/globalStyle';
import Header from '../../components/Header';
import Slider from '../../components/Slider';
import MenuComponent from '../../components/MenuComponent';
import FooterContact from '../../components/FooterContact';
import { COMPANY_CELEBRATION, COMPANY_LOGO } from '../../config';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const PRIMARY_COLOR = '#966EAF';

// Define explicit dimensions for the celebration card so border hugs the image edges perfectly
const LOGO_WIDTH = width * 0.85;
const LOGO_HEIGHT = height * 0.25;

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const navigateToDashboard = () => {
    if (user?.type === 'policy holder') {
      navigation.navigate('PhPolicyList');
    } else if (user?.type === 'agent') {
      navigation.navigate('DashboardProducer');
    }
  };

  const allMenus = [
    ...(isAuthenticated
      ? [
        { title: 'New Policy', navigateTo: 'PhPayFirstPremium', icon: require('../../assets/pay-first-premiums-menu.jpg'), zoomOut: true },
      ]
      : []),

    { title: 'Pay Premium', navigateTo: 'PayPremium', icon: require('../../assets/icon-online-payment.png') },
    { title: 'Premium Calculator', navigateTo: 'PremiumCalculator', icon: require('../../assets/icon-premium-calc.png') },
    { title: 'Policy Information', navigateTo: isAuthenticated ? 'AuthPolicyInfo' : 'PolicyInfo', icon: require('../../assets/icon-policy-info.png') },
    ...(isAuthenticated
      ? [
        { title: 'Receipt Download', navigateTo: 'PayFirstPremiumTransaction', icon: require('../../assets/icon-premium-calc.png') },
      ]
      : []),
    { title: 'Phone No Update', navigateTo: 'PolicyPhoneUpdate', icon: require('../../assets/product-engine.png') },
    { title: 'Company Information', navigateTo: 'CompanyInfo', icon: require('../../assets/icon-company-info.png') },
    { title: 'Our Product', navigateTo: 'ProductInfo', icon: require('../../assets/product-engine.png') },
    ...(isAuthenticated
      ? [
        { title: 'Business Report', navigateTo: 'CodeWiseCollectionScreen', icon: require('../../assets/icon-claim-submission.png') },
      ]
      : []),
  ];

  const loginMenu = (
    <MenuComponent
      onPress={isAuthenticated ? navigateToDashboard : () => navigation.navigate('Login')}
      icon={require('../../assets/icon-login.png')}
      title={isAuthenticated
        ? (user?.type === 'policy holder' ? 'Policy List' : 'Dashboard')
        : 'Role base login'
      }
    />
  );

  const myAccountMenu = isAuthenticated ? (
    <MenuComponent
      onPress={() =>
        user?.type === 'policy holder'
          ? navigation.navigate('PhMyProfile')
          : navigation.navigate('OrgMyProfile')
      }
      icon={require('../../assets/icon-my-transaction.png')}
      title="My Account"
    />
  ) : null;

  // Final order: Login first → all menus → My Account last
  const menuItems = [
    React.cloneElement(loginMenu, { key: 'login-menu' }),
    ...allMenus.map((item, i) => (
      <MenuComponent
        key={`menu-${i}`}           
        title={item.title}
        icon={item.icon}
        zoomOut={item.zoomOut}
        onPress={() => navigation.navigate(item.navigateTo)}
      />
    )),
    myAccountMenu ? React.cloneElement(myAccountMenu, { key: 'my-account-menu' }) : null,
  ].filter(Boolean);

  return (
    <View style={[styles.safeArea, { backgroundColor: '#fff' }]}>
      <StatusBar
        backgroundColor={PRIMARY_COLOR}
        barStyle="light-content"
      />
      <View style={globalStyle.container}>
        <Header navigation={navigation} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Slider />
          {/* <View style={styles.logoContainer}>
            <Image
              source={COMPANY_LOGO} 
              style={styles.bigLogo}
              resizeMode="contain"
            />
          </View> */}

          {/* Main layout section housing the image framing & typography */}
          <View style={styles.celebrationSection}>
            <View style={styles.logoBorderFrame}>
              <Image
                source={COMPANY_CELEBRATION}
                style={styles.bigLogo}
                resizeMode="cover" 
              />
            </View>
            <Text style={styles.celebrationText}>
              25 Years of Popular Life Insurance
            </Text>
          </View>

          <View style={globalStyle.wrapper}>
            <View style={styles.grid}>
              {menuItems}
            </View>
          </View>
        </ScrollView>
        <FooterContact />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#966EAF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // This style is for the logo and below one is for celebration image. We keep them separate to maintain the integrity of the celebration graphic which has its own design and dimensions.
  // bigLogo: {
  //   width: width * 0.6,
  //   height: height * 0.2,
  // },
  celebrationSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  logoBorderFrame: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    borderWidth: 2,
    borderColor: '#966EAF',
    borderRadius: 8,
    overflow: 'hidden', // Crucial to prevent image corners from spilling out of the borderRadius
    backgroundColor: '#fff',
  },
  bigLogo: {
    width: '100%',
    height: '100%',
  },
  celebrationText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#966EAF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;