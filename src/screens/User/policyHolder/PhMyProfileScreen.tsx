import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

import globalStyle from '../../../styles/globalStyle';
import Header from '../../../components/Header';

type PhMyProfileScreenProps = {
  navigation: any;
};

const PhMyProfileScreen: React.FC<PhMyProfileScreenProps> = ({ navigation }) => {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} title={'My Account'} />

      <ScrollView>
        <View style={styles.rowWrapper}>
          <Text style={styles.rowIcon}>
            <Icon name="md-person-outline" size={24} color="#966EAF" />
          </Text>
          <Text style={styles.rowValue}>{user?.name || '-'}</Text>
        </View>

        <View style={styles.rowWrapper}>
          <Text style={styles.rowIcon}>
            <Icon name="md-mail-outline" size={24} color="#966EAF" />
          </Text>
          <Text style={styles.rowValue}>{user?.email || '-'}</Text>
        </View>

        <View style={styles.rowWrapper}>
          <Text style={styles.rowIcon}>
            <Icon name="md-call-outline" size={24} color="#966EAF" />
          </Text>
          <Text style={styles.rowValue}>{user?.phone || '-'}</Text>
        </View>

        <View style={styles.rowWrapper}>
          <Text style={styles.rowIcon}>
            <Icon name="filter-outline" size={24} color="#966EAF" />
          </Text>
          <Text style={styles.rowValue}>{user?.type || '-'}</Text>
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
    borderColor: '#b3b3b3',
    paddingVertical: 15,
  },
  rowIcon: {
    flex: 1,
    textAlign: 'center',
  },
  rowValue: {
    flex: 2,
    textAlign: 'left',
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#7c7979',
  },
});

export default PhMyProfileScreen;