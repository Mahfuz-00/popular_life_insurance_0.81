import React, { useEffect } from 'react';
import { View, Alert, BackHandler, Linking, Platform } from 'react-native';
import VersionCheck from 'react-native-version-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider } from 'react-redux';

import store from './src/store/index'; 
import { loadUser, userPayPremium } from './src/actions/userActions';

// -- Types --
import type { RootStackParamList } from './src/navigation/RootStackParamList';

// -- Screens (grouped for clarity) --
// Public screens
import HomeScreen from './src/screens/Dashboard/HomeScreen';
import PremiumCalculatorScreen from './src/screens/Dashboard/PremiumCalculatorScreen';
import CompanyInfoScreen from './src/screens/Dashboard/CompanyInfoScreen';
import LocateUsScreen from './src/screens/Dashboard/LocateUsScreen';
import PayPremiumScreen from './src/screens/Dashboard/PayPremiumScreen';
import ProductInfoScreen from './src/screens/Dashboard/ProductInfoScreen';
import ClaimSubmissionScreen from './src/screens/Dashboard/ClaimSubmissionScreen';
import MessageFromMd from './src/screens/Dashboard/MessageFromMd';
import PolicyInfoScreen from './src/screens/Dashboard/PolicyInfoScreen';
import ContactUsScreen from './src/screens/Dashboard/ContactUsScreen';
import ApplyOnlineScreen from './src/screens/Dashboard/ApplyOnlineScreen';
import ProposalTrackingScreen from './src/screens/Dashboard/ProposalTrackingScreen';
import MyTransactionScreen from './src/screens/Dashboard/MyTransactionScreen';
import SyncPaymentScreen from './src/screens/User/policyHolder/SyncPaymentScreen';
import CodeWiseCollectionScreen from './src/screens/Dashboard/CodeWiseCollectionScreen';
import PolicyPhoneUpdateScreen from './src/screens/Dashboard/PolicyPhoneUpdateScreen';

// First premium / payment flows
import PayFirstPremiumScreen from './src/screens/Dashboard/firstpremium/PayFirstPremiumScreen';
import PayfirstPremiumGateway from './src/screens/Dashboard/firstpremium/PayFirstPremiumGateway';
import FirstPremiumTransactionsScreen from './src/screens/Dashboard/firstpremium/PayFirstPremiumTransactionsScreen';

// Auth
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegistrationScreen from './src/screens/Auth/RegistrationScreen';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/Auth/ResetPasswordScreen';
import Loading from './src/components/Loading';
import SelectLoginScreen from './src/screens/Auth/SelectLoginScreen';

// Policy holder screens
import DashboardPhScreen from './src/screens/User/policyHolder/DashboardPhScreen';
import PhPolicyListScreen from './src/screens/User/policyHolder/PhPolicyListScreen';
import PhPolicyStatementScreen from './src/screens/User/policyHolder/PhPolicyStatementScreen';
import PhDuePremiumScreen from './src/screens/User/policyHolder/PhDuePremiumScreen';
import PhPayPremiumScreen from './src/screens/User/policyHolder/PhPayPremiumScreen';
import PhPolicyTransactionsScreen from './src/screens/User/policyHolder/PhPolicyTransactionsScreen';
import PhPolicyPartialTransactionsScreen from './src/screens/User/policyHolder/PhPolicyPartialTransactionsScreen';
import AuthPolicyInfoScreen from './src/screens/Dashboard/AuthPolicyInfoScreen';
import PhMyProfileScreen from './src/screens/User/policyHolder/PhMyProfileScreen';
import PhClaimSubmissionScreen from './src/screens/User/policyHolder/PhClaimSubmissionScreen';
import PhPRListScreen from './src/screens/User/policyHolder/PhPRListScreen copy';

// Producer screens
import DashboardProducerScreen from './src/screens/User/producer/DashboardProducerScreen';
import BusinessInfoScreen from './src/screens/User/producer/BusinessInfoScreen';
import EarningInfoScreen from './src/screens/User/producer/EarningInfoScreen';
import PolicyListScreen from './src/screens/User/producer/PolicyListScreen';
import OrgMyProfileScreen from './src/screens/User/producer/OrgMyProfileScreen';

// Drawer content
import DrawerContent from './src/components/DrawerContent';
import { DrawerParamList } from './src/navigation/DrawerParamList';


// -- Navigator types --
const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

// -- Helpers --

/**
 * Sync offline payments stored in AsyncStorage under key 'syncPayments'.
 * Each payment is passed to userPayPremium (re-using your existing action).
 * If success, the payment is removed from stored array.
 */
const handleSyncPayments = async () => {
  try {
    const stored = await AsyncStorage.getItem('syncPayments');
    const syncPayments = stored ? JSON.parse(stored) : [];

    for (const payment of syncPayments) {
      try {
        // userPayPremium might be a thunk; ensure it returns a promise/boolean
        const isSuccess = await userPayPremium(payment);
        if (isSuccess) {
          const updated = syncPayments.filter(
            (item: any) => item.transaction_no !== payment.transaction_no
          );
          await AsyncStorage.setItem('syncPayments', JSON.stringify(updated));
        }
      } catch (err) {
        console.log('Single sync payment failed:', err);
      }
    }
  } catch (error) {
    console.log('Sync payments error:', error);
  }
};

/**
 * Check if an update is needed (Android-only). If needed, prompt user to update and
 * open the store URL. Call BackHandler.exitApp() before opening URL so user can't continue.
 */
const checkUpdateNeeded = async () => {
  try {
    const updateNeeded = await VersionCheck.needUpdate();
    if (updateNeeded?.isNeeded) {
      Alert.alert(
        'Update Available!',
        'Please update the app to continue.',
        [
          {
            text: 'Update',
            onPress: () => {
              BackHandler.exitApp();
              Linking.openURL(updateNeeded.storeUrl);
            },
          },
        ],
        { cancelable: false }
      );
    }
  } catch (error) {
    console.log('Update check failed:', error);
  }
};

// -- App Component --
export default function App() {
  useEffect(() => {
    // load user into redux
    store.dispatch(loadUser() as any);

    // attempt to sync offline payments
    handleSyncPayments();

    // Android update check
    if (Platform.OS === 'android') {
      checkUpdateNeeded();
    }
  }, []);

  // Helper to cast components to a permissive type so Navigator accepts them without
  // forcing you to change every screen file's props/signature right now.
  const asScreen = (Comp: React.ComponentType<any>) =>
    (Comp as unknown) as React.ComponentType<any>;

  return (
    <Provider store={store}>
      <Loading />
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{ headerShown: false }}
          drawerContent={(props) => <DrawerContent {...props} />}
        >
          <Drawer.Screen name="MainStack" options={{ headerShown: false }}>
            {() => (
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                {/* ---------- Public ---------- */}
                <Stack.Screen name="Home" component={asScreen(HomeScreen)} />
                <Stack.Screen
                  name="PremiumCalculator"
                  component={asScreen(PremiumCalculatorScreen)}
                />
                <Stack.Screen name="CompanyInfo" component={asScreen(CompanyInfoScreen)} />
                <Stack.Screen name="LocateUs" component={asScreen(LocateUsScreen)} />
                <Stack.Screen name="PayPremium" component={asScreen(PayPremiumScreen)} />
                <Stack.Screen name="ProductInfo" component={asScreen(ProductInfoScreen)} />
                <Stack.Screen name="ClaimSubmission" component={asScreen(ClaimSubmissionScreen)} />
                <Stack.Screen name="MessageFromMd" component={asScreen(MessageFromMd)} />
                <Stack.Screen name="PolicyInfo" component={asScreen(PolicyInfoScreen)} />
                <Stack.Screen name="ContactUs" component={asScreen(ContactUsScreen)} />
                <Stack.Screen name="ApplyOnline" component={asScreen(ApplyOnlineScreen)} />
                <Stack.Screen name="ProposalTracking" component={asScreen(ProposalTrackingScreen)} />
                <Stack.Screen name="MyTransaction" component={asScreen(MyTransactionScreen)} />
                <Stack.Screen name="PolicyPhoneUpdate" component={asScreen(PolicyPhoneUpdateScreen)}/>
                <Stack.Screen name="SyncPayment" component={asScreen(SyncPaymentScreen)} />
                <Stack.Screen
                  name="CodeWiseCollectionScreen"
                  component={asScreen(CodeWiseCollectionScreen)}
                />

                {/* ---------- First Premium / Payment Flow ---------- */}
                <Stack.Screen name="PhPayFirstPremium" component={asScreen(PayFirstPremiumScreen)} />
                <Stack.Screen
                  name="PayfirstPremiumGateways"
                  component={asScreen(PayfirstPremiumGateway)}
                />
                <Stack.Screen
                  name="PayFirstPremiumTransaction"
                  component={asScreen(FirstPremiumTransactionsScreen)}
                />

                {/* ---------- Auth ---------- */}
                <Stack.Screen name="Login" component={asScreen(LoginScreen)} />
                <Stack.Screen name="Registration" component={asScreen(RegistrationScreen)} />
                <Stack.Screen name="ForgotPassword" component={asScreen(ForgotPasswordScreen)} />
                <Stack.Screen name="ResetPassword" component={asScreen(ResetPasswordScreen)} />
                <Stack.Screen name="SelectLogin" component={asScreen(SelectLoginScreen)} />

                {/* ---------- Policy Holder ---------- */}
                <Stack.Screen name="DashboardPh" component={asScreen(DashboardPhScreen)} />
                <Stack.Screen name="PhPolicyList" component={asScreen(PhPolicyListScreen)} />
                <Stack.Screen name="PhPolicyStatement" component={asScreen(PhPolicyStatementScreen)} />
                <Stack.Screen name="PhDuePremium" component={asScreen(PhDuePremiumScreen)} />
                <Stack.Screen name="PhPayPremium" component={asScreen(PhPayPremiumScreen)} />
                <Stack.Screen
                  name="PhPolicyTransactions"
                  component={asScreen(PhPolicyTransactionsScreen)}
                />
                <Stack.Screen
                  name="PhPolicyPartialTransactions"
                  component={asScreen(PhPolicyPartialTransactionsScreen)}
                />
                <Stack.Screen name="AuthPolicyInfo" component={asScreen(AuthPolicyInfoScreen)} />
                <Stack.Screen name="PhMyProfile" component={asScreen(PhMyProfileScreen)} />
                <Stack.Screen name="PhClaimSubmission" component={asScreen(PhClaimSubmissionScreen)} />
                <Stack.Screen name="PhPRList" component={asScreen(PhPRListScreen)} />

                {/* ---------- Producer ---------- */}
                <Stack.Screen name="DashboardProducer" component={asScreen(DashboardProducerScreen)} />
                <Stack.Screen name="BusinessInfo" component={asScreen(BusinessInfoScreen)} />
                <Stack.Screen name="EarningInfo" component={asScreen(EarningInfoScreen)} />
                <Stack.Screen name="PolicyList" component={asScreen(PolicyListScreen)} />
                <Stack.Screen name="OrgMyProfile" component={asScreen(OrgMyProfileScreen)} />
              </Stack.Navigator>
            )}
          </Drawer.Screen>
        </Drawer.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
