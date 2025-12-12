import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import moment from 'moment';
import globalStyle from '../../styles/globalStyle';

interface DetailsTableProps {
  data: any;
  projectsUnfiltered: Array<{ label: string; value: string }>;
  code: string;
}

const DetailsTable: React.FC<DetailsTableProps> = ({ data, projectsUnfiltered, code }) => {
  if (!data || Object.keys(data).length === 0) {
    return <Text style={[globalStyle.fontMedium, styles.noData]}>No data found</Text>;
  }

  const getProjectLabel = (projectCode: string) => {
    const project = projectsUnfiltered.find(p => p.value === projectCode);
    return project ? project.label : projectCode;
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyle.fontBold, styles.title]}>Popular Life Insurance Co.Ltd.</Text>
      <Text style={[globalStyle.fontMedium, styles.subtitle]}>Code Wise Collection Details</Text>
      <Text style={[globalStyle.fontMedium, styles.codeInfo]}>Code No: {code}</Text>

      {Object.keys(data).map((project, projectIndex) => (
        <View key={projectIndex}>
          <Text style={[globalStyle.fontMedium, styles.yearHeader, { textAlign: 'center' }]}>
            Project: {getProjectLabel(project)}
          </Text>

          {Object.keys(data[project]?.data || {}).map((year, yearIndex) => (
            <View key={yearIndex}>
              <Text style={[globalStyle.fontMedium, styles.yearHeader]}>{year}</Text>

              {Object.keys(data[project].data[year]?.data || {}).map((month, monthIndex) => {
                const monthData = data[project].data[year].data[month];
                return (
                  <View key={monthIndex}>
                    <Text style={[globalStyle.fontMedium, styles.monthHeader]}>{month}</Text>
                    <View style={styles.tableHeader}>
                      <Text style={styles.headerCell}>Trns. No</Text>
                      <Text style={styles.headerCell}>Amount</Text>
                      <Text style={styles.headerCell}>D/R</Text>
                      <Text style={styles.headerCell}>Date</Text>
                    </View>

                    {(monthData?.data || []).map((txn: any, idx: number) => (
                      <View style={styles.row} key={idx}>
                        <Text style={styles.cell}>{txn.transaction_no || 'N/A'}</Text>
                        <Text style={styles.cell}>{txn.amount || '0.00'}</Text>
                        <Text style={styles.cell}>{txn.type || 'N/A'}</Text>
                        <Text style={styles.cell}>
                          {txn.date ? moment(txn.date.original).format('DD-MM-YYYY') : 'N/A'}
                        </Text>
                      </View>
                    ))}

                    <View style={[styles.row, styles.subTotal]}>
                      <Text style={styles.cell}>Sub Total</Text>
                      <Text style={styles.cell}>{monthData?.total || '0.00'}</Text>
                      <Text style={styles.cell}></Text>
                      <Text style={styles.cell}></Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          {/* Project Totals */}
          <View style={styles.totals}>
            <View style={styles.row}>
              <Text style={styles.cell}>Grand Total</Text>
              <Text style={styles.cell}>{data[project]?.total || '0.00'}</Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cell}></Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderWidth: 2, borderColor: '#5382AC', marginVertical: 15, backgroundColor: '#fff' },
  title: { textAlign: 'center', fontSize: 18, marginVertical: 10 },
  subtitle: { textAlign: 'center', fontSize: 16, marginBottom: 5 },
  codeInfo: { textAlign: 'center', fontSize: 14, marginBottom: 10 },
  yearHeader: { fontSize: 18, fontFamily: globalStyle.fontBold.fontFamily, marginVertical: 10, marginLeft: 10 },
  monthHeader: { fontSize: 16, marginVertical: 10, marginLeft: 10 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderColor: '#5382AC', backgroundColor: '#F0F8FF' },
  headerCell: { flex: 1, textAlign: 'center', padding: 5, fontFamily: globalStyle.fontBold.fontFamily },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#5382AC' },
  cell: { flex: 1, textAlign: 'center', padding: 5, fontFamily: globalStyle.fontMedium.fontFamily },
  subTotal: { backgroundColor: '#E6E6FA' },
  totals: { marginTop: 10, borderTopWidth: 2, borderColor: '#5382AC' },
  noData: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
});

export default DetailsTable;