import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { COMPANY_NAME, COMPANY_LOGO } from '../config';
import { logout } from '../actions/userActions';

const { width } = Dimensions.get('window');
const guidelineBaseWidth = 360;
const scale = (size: number) => (width / guidelineBaseWidth) * size;

const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { navigation } = props;
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<any>();

  const logoutHandler = () => {
    dispatch(logout(navigation));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.drawer}>
        {/* Header */}
        <View style={styles.header}>
          <Icon
            name="arrow-back-sharp"
            size={scale(26)}
            color="#000"
            onPress={() => navigation.closeDrawer()}
            style={styles.backIcon}
          />
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image source={COMPANY_LOGO} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{COMPANY_NAME}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Scrollable Menu */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>General</Text>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              onPress={() => navigation.navigate(item.screen)}
            />
          ))}

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>About</Text>
          {aboutItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              onPress={() => navigation.navigate(item.screen)}
            />
          ))}

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Account</Text>
          {!isAuthenticated ? (
            <>
              <MenuItem icon="log-in-outline" label="Login" onPress={() => navigation.navigate('Login')} />
              <MenuItem icon="person-add-outline" label="Register" onPress={() => navigation.navigate('Registration')} />
            </>
          ) : (
            <MenuItem
              icon="log-out-outline"
              label="Logout"
              onPress={logoutHandler}
              textStyle={{ color: '#D32F2F' }}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Reusable Menu Item
const MenuItem: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  textStyle?: object;
}> = ({ icon, label, onPress, textStyle }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Icon name={icon} size={scale(26)} color="#000" />
    </View>
    <Text style={[styles.menuText, textStyle]}>{label}</Text>
  </TouchableOpacity>
);

// Menu Data
const menuItems = [
  { icon: 'home-outline', label: 'Home', screen: 'Home' },
  { icon: 'mail-outline', label: 'Message from CEO', screen: 'MessageFromMd' },
  { icon: 'create-outline', label: 'Apply for Policy', screen: 'ApplyOnline' },
  { icon: 'phone-portrait-outline', label: 'Policy Phone No Update', screen: 'PolicyPhoneUpdate' },
  { icon: 'document-text-outline', label: 'Policy Info', screen: 'PolicyInfo' },
  { icon: 'calculator-outline', label: 'Premium Calculator', screen: 'PremiumCalculator' },
];

const aboutItems = [
  { icon: 'call-outline', label: 'Contact Us', screen: 'ContactUs' },
  { icon: 'cube-outline', label: 'Product Info', screen: 'ProductInfo' },
  { icon: 'business-outline', label: 'Company Info', screen: 'CompanyInfo' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  drawer: { flex: 1 },
  header: { paddingHorizontal: scale(15), paddingTop: scale(10), paddingBottom: scale(15) },
  backIcon: { marginBottom: scale(10) },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  logoContainer: { width: '30%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: '100%', height: '100%', resizeMode: 'contain' },
  companyInfo: { flex: 1, justifyContent: 'center', paddingLeft: scale(12) },
  companyName: { fontSize: scale(16), fontWeight: 'bold', color: '#000' },
  divider: { height: 1, backgroundColor: '#ccc', marginHorizontal: scale(15), marginVertical: scale(12) },
  sectionTitle: { fontSize: scale(16), fontWeight: '600', color: '#333', marginLeft: scale(20), marginTop: scale(12), marginBottom: scale(6) },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: scale(12), paddingHorizontal: scale(15) },
  menuIconContainer: { width: '15%', alignItems: 'center' },
  menuText: { fontSize: scale(15), color: '#000', marginLeft: scale(8), flex: 1 },
});

export default DrawerContent;
