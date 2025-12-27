import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Image} from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import globalStyle from '../../styles/globalStyle';
import Header from '../../components/Header';
import Slider from '../../components/Slider';
import MenuComponent from '../../components/MenuComponent';
import FooterContact from '../../components/FooterContact';
import { COMPANY_LOGO } from '../../config';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

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
    loginMenu,
    ...allMenus.map((item, i) => (
      <MenuComponent
        key={i}
        title={item.title}
        icon={item.icon}
        zoomOut={item.zoomOut}
        onPress={() => navigation.navigate(item.navigateTo)}
      />
    )),
    myAccountMenu,
  ].filter(Boolean);

  return (
    <SafeAreaView style={{ flex: 1}}>
    <View style={globalStyle.container}>
      <Header navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Slider />
        <View style={styles.logoContainer}>
        <Image
          source={COMPANY_LOGO}
          style={styles.bigLogo}
          resizeMode="contain"
        />
      </View>

        <View style={globalStyle.wrapper}>
          <View style={styles.grid}>
            {menuItems}
          </View>
        </View>
      </ScrollView>
      <FooterContact />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',   
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  bigLogo: {
    width: width * 0.6,
    height: height * 0.2,
  },
});

export default HomeScreen;