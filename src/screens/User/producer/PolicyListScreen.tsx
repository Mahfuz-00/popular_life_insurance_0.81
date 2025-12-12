// src/screens/producer/PolicyListScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import globalStyle from '../../../styles/globalStyle';
import Pagination from '../../../components/Pagination';
import Header from '../../../components/Header';
import { PRIMARY_BUTTON_BG } from '../../../store/constants/colorConstants';

type PolicyListScreenProps = {
  navigation: any;
};

interface Policy {
  Policyno: string;
  ProposersName: string;
  SumAssured: string;
  TotalPremium: string;
  Comdate: string;
}

const Card: React.FC<Policy> = ({ Policyno, ProposersName, SumAssured, TotalPremium, Comdate }) => {
  return (
    <View>
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardText}>Policy No: {Policyno}</Text>
          <Text style={styles.cardText}>Com Date: {Comdate}</Text>
        </View>
        <Text style={styles.cardText}>Name: {ProposersName}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardText}>Sum Assured: {SumAssured}</Text>
          <Text style={styles.cardText}>Total Premium: {TotalPremium}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const PolicyListScreen: React.FC<PolicyListScreenProps> = ({ navigation }) => {
  const [policyList] = useState<Policy[]>([
    { Policyno: '10101010-1', ProposersName: 'XXXXXX', SumAssured: '100000', TotalPremium: '1000', Comdate: '01/01/2021' },
    { Policyno: '10101010-1', ProposersName: 'XXXXXX', SumAssured: '100000', TotalPremium: '1000', Comdate: '01/01/2021' },
    { Policyno: '10101010-1', ProposersName: 'XXXXXX', SumAssured: '100000', TotalPremium: '1000', Comdate: '01/01/2021' },
    { Policyno: '10101010-1', ProposersName: 'XXXXXX', SumAssured: '100000', TotalPremium: '1000', Comdate: '01/01/2021' },
    { Policyno: '10101010-1', ProposersName: 'XXXXXX', SumAssured: '100000', TotalPremium: '1000', Comdate: '01/01/2021' },
    { Policyno: '10101010-1', ProposersName: 'XXXXXX', SumAssured: '100000', TotalPremium: '1000', Comdate: '01/01/2021' },
    { Policyno: '10101010-1', ProposersName: 'XXXXXX', SumAssured: '100000', TotalPremium: '1000', Comdate: '01/01/2021' },
  ]);

  const limit = 10;
  const [currentPage, setCurrentPage] = useState<string>('1');
  const [totalPages, setTotalPages] = useState<string>('10');

  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} title={'Policy List'} />

      <View style={[styles.cardWrapper, { marginTop: 10 }]}>
        <ScrollView>
          {policyList.length !== 0 &&
            policyList.map((item, index) => (
              <Card
                key={index}
                Policyno={item.Policyno}
                ProposersName={item.ProposersName}
                SumAssured={item.SumAssured}
                TotalPremium={item.TotalPremium}
                Comdate={item.Comdate}
              />
            ))}
        </ScrollView>
      </View>

      <View style={styles.paginationWrapper}>
        <Pagination totalPages={totalPages} setCurrentPage={setCurrentPage} currentPage={currentPage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 15,
  },
  paginationWrapper: {},
  card: {
    width: '100%',
    height: 100,
    backgroundColor: '#5382AC',
    borderRadius: 5,
    marginBottom: 15,
    padding: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardText: {
    color: '#FFF',
    fontFamily: globalStyle.fontMedium.fontFamily,
  },
});

export default PolicyListScreen;