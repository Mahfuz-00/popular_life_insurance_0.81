import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';

import { COMPANY_LOGO, COMPANY_NAME } from '../config';
import globalStyle from '../styles/globalStyle';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 360) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 800) * size;

type HeaderProps = {
  navigation: any;
  title?: string;
};

const Header: React.FC<HeaderProps> = ({ navigation, title }) => {
  const showTitleCard = title && title.trim() !== '';

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.getParent?.()?.canGoBack?.()) {
      navigation.getParent().goBack();
    }
  };

  const isIOS = Platform.OS === 'ios';

  return (
    <>
      <StatusBar backgroundColor="#966EAF" barStyle="light-content" />

      <View style={styles.mainContainer}>
        {/* Purple Curved Header */}
        <View style={styles.headerBar}>
          <View style={styles.row}>
            {/* Left: Back button + Logo */}
            <View
              style={[
                styles.leftContainer,
                isIOS && { width: '10%', flexDirection: 'row', alignItems: 'center', marginEnd: 5 },
              ]}
            >
              {isIOS && (
                <TouchableOpacity onPress={handleBack} style={styles.backButtonContainer}>
                  <Text style={styles.backButton}>{'‹'}</Text>
                </TouchableOpacity>
              )}
              <Image source={COMPANY_LOGO} style={styles.logo} resizeMode="contain" />
            </View>

            {/* Company Name */}
            <View style={[styles.nameContainer, isIOS && { width: '75%' }]}>
              <Text
                style={[styles.companyName, isIOS && { fontSize: scale(16), marginLeft: scale(4) }]}
                numberOfLines={1}
              >
                {COMPANY_NAME}
              </Text>
            </View>

            {/* Drawer Toggle */}
            <View style={styles.drawerContainer}>
              <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                <Image
                  source={require('../assets/icon-drawer-toggle.png')}
                  style={styles.drawerIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* White Title Card */}
        {showTitleCard && (
          <View style={styles.titleCard}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    alignItems: 'center',
  },
  headerBar: {
    width: '100%',
    height: verticalScale(110),
    backgroundColor: '#966EAF',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight || verticalScale(30),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: scale(8),
    marginBottom: verticalScale(20),
    justifyContent: 'space-between',
  },
  leftContainer: {
    width: '10%',
    justifyContent: 'flex-start',
  },
  backButtonContainer: {
    width: '50%',
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: scale(28),
    lineHeight: scale(28),
    fontWeight: '600',
  },
  nameContainer: {
    width: '80%',
    alignItems: 'center',
  },
  drawerContainer: {
    width: '10%',
    alignItems: 'flex-end',
  },
  logo: {
    width: scale(48),
    height: scale(48),
  },
  companyName: {
    ...globalStyle.fontFjallaOne,
    fontSize: scale(18),
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  drawerIcon: {
    width: scale(28),
    height: scale(28),
  },
  titleCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    alignItems: 'center',
    padding: 10,
    width: '90%',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  titleText: {
    ...globalStyle.fontFjallaOne,
    fontSize: 18,
  },
});

export default Header;