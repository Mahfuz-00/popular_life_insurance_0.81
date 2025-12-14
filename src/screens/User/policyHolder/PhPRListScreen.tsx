import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/index'; 
import { SHOW_LOADING, HIDE_LOADING } from '../../../store/constants/commonConstants'; 

import globalStyle from '../../../styles/globalStyle';
import BackgroundImage from '../../../assets/BackgroundImage.png';
import Header from '../../../components/Header';
import { getPrListByUser } from '../../../actions/userActions';

type PhPRListScreenProps = {
  navigation: any;
  route: {
    params: {
      policyNo: string;
    };
  };
};

interface PRItem {
  prno: string;
  prdate: { format3: string };
  pramount: string | number;
}

interface PRYearGroup {
  pr: PRItem[];
  total: string | number;
}

const PhPRListScreen: React.FC<PhPRListScreenProps> = ({ navigation, route }) => {
  const { policyNo } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const [prList, setPrList] = useState<Record<string, PRYearGroup>>({});
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      dispatch({ type: SHOW_LOADING, payload: 'Fetching PR List...' });

      try {
        const response = await dispatch(getPrListByUser(policyNo)); 
        
        if (response) {
          setPrList(response);
        } else {
          setPrList({});
        }
      } catch (error) {
        console.error('Failed to fetch PR list:', error);
        setPrList({});
      } finally {
        setIsLoading(false);
        dispatch({ type: HIDE_LOADING });
      }
    }
    fetchData();
  }, [dispatch, policyNo]);

  const hasData = Object.keys(prList).length > 0;

  const formatShortYear = (dateString: string) => {
    // This regex looks for a 4-digit year preceded by a dash at the end of the string,
    // and replaces the 4 digits with the last 2 digits.
    // e.g., '21-07-2007' -> '21-07-07'
    if (!dateString) return '-';
    return dateString.replace(/-\d{4}$/, (match) => {
        return '-' + match.slice(-2);
    });
};

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title={`PR List (${policyNo})`} />

        {/* Table Header */}
        <View style={[styles.rowWrapper]}>
          <Text style={[styles.rowLable, globalStyle.tableText, {color: '#fff',}]}>PR No</Text>
          <Text style={[styles.rowLable, globalStyle.tableText, {color: '#fff',}]}>PR Date</Text>
          <Text style={[styles.rowLable, globalStyle.tableText, {color: '#fff',}]}>Amount</Text>
        </View>

        {/* ⭐️ Loading Indicator / Content */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#5382AC" />
            <Text style={[globalStyle.fontMedium, { marginTop: 10, color: '#000' }]}>
              Loading payment receipts...
            </Text>
          </View>
        ) : hasData ? (
          <ScrollView>
            <View style={[globalStyle.wrapper,]}>
              <View style={{ marginVertical: 8 }}>
                {Object.keys(prList).map((year, index) => (
                  <View key={index}>
                    {/* Year Header */}
                    <View style={styles.yearHeaderRow}>
                      <Text style={[styles.yearLabel, globalStyle.tableText]}>{year}</Text>
                      <Text style={[styles.yearTotalLabel, globalStyle.tableText]}>
                        Total: {prList[year].total}
                      </Text>
                    </View>

                    {/* PR Items */}
                    {prList[year].pr.map((prItem, idx) => (
                      <View style={[styles.rowWrapper, { marginHorizontal: 0,} ]} key={idx}>
                        <Text style={[styles.rowValue, globalStyle.tableText]}>
                          {prItem.prno}
                        </Text>
                        <Text style={[styles.rowValue, globalStyle.tableText]}>
                          {formatShortYear(prItem.prdate.format3)}
                        </Text>
                        <Text style={[styles.rowValue, globalStyle.tableText]}>
                          {prItem.pramount}
                        </Text>
                      </View>
                    ))}

                    {/* Divider */}
                    <View style={{ borderWidth: 0.5, marginHorizontal: 15, marginVertical: 8, borderColor: '#ccc' }} />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={[globalStyle.fontMedium, { color: '#FF0000', fontSize: 16 }]}>
              No PR (Payment Receipt) list found for policy {policyNo}.
            </Text>
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rowWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff', 
    marginHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  yearHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#D0E0F0', 
    paddingVertical: 8,
    // marginHorizontal: 15,
    marginTop: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  yearLabel: {
    flex: 1,
    textAlign: 'left',
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  yearTotalLabel: {
    flex: 1,
    textAlign: 'right',
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  rowLable: { 
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    fontWeight: 'bold',
    backgroundColor: '#5382AC', 
    color: '#FFF',
  },
  rowValue: { 
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontFamily: globalStyle.fontMedium.fontFamily,
    color: '#333',
  },
});

export default PhPRListScreen;