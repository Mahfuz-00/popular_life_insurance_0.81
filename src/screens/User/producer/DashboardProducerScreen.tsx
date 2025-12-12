import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import globalStyle from '../../../styles/globalStyle';
import MenuComponent from '../../../components/MenuComponent';
import { logout } from '../../../actions/userActions';
import Header from '../../../components/Header';
import { AppDispatch } from '../../../store/index';

type DashboardProducerScreenProps = {
  navigation: any;
};

const DashboardProducerScreen: React.FC<DashboardProducerScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const menus = [
    { title: 'Business Info', navigateTo: 'BusinessInfo', icon: require('../../../assets/icon-company-info.png') },
    { title: 'My Earnings', navigateTo: 'EarningInfo', icon: require('../../../assets/icon-my-transaction.png') },
    { title: 'My Policies', navigateTo: 'PolicyList', icon: require('../../../assets/icon-premium-calc.png') },
  ];

  const logoutHandler = () => {
    dispatch(logout(navigation));
  };

  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} title={'Producer Dashboard'} />

      <ScrollView>
        <View style={globalStyle.wrapper}>
          {/* Producer Info Card */}
          <View style={{ backgroundColor: '#5382AC', borderRadius: 15, padding: 5 }}>
            <View style={styles.rowWrapper}>
              <Text style={[styles.rowLable, globalStyle.tableText]}>ID</Text>
              <Text style={[styles.rowValue, globalStyle.tableText]}>010101</Text>
            </View>

            <View style={styles.rowWrapper}>
              <Text style={[styles.rowLable, globalStyle.tableText]}>Name</Text>
              <Text style={[styles.rowValue, globalStyle.tableText]}>XXXXXX</Text>
            </View>

            <View style={styles.rowWrapper}>
              <Text style={[styles.rowLable, globalStyle.tableText]}>Designation</Text>
              <Text style={[styles.rowValue, globalStyle.tableText]}>SEVP</Text>
            </View>

            <View style={styles.rowWrapper}>
              <Text style={[styles.rowLable, globalStyle.tableText]}>Office</Text>
              <Text style={[styles.rowValue, globalStyle.tableText]}>XXXX XXXXX XXXXXX</Text>
            </View>
          </View>

          {/* Menu Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {menus.map((item, index) => (
              <MenuComponent
                key={index}
                onPress={() => navigation.navigate(item.navigateTo)}
                icon={item.icon}
                title={item.title}
              />
            ))}

            <MenuComponent
              onPress={() => logoutHandler()}
              icon={require('../../../assets/icon-premium-calc.png')}
              title={'Logout'}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 2,
    borderColor: '#5382AC',
  },
  rowLable: {
    flex: 0.5,
    textAlign: 'center',
    borderRightWidth: 2,
    borderColor: '#5382AC',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#FFF',
  },
  rowValue: {
    flex: 1.5,
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#FFF',
  },
});

export default DashboardProducerScreen;