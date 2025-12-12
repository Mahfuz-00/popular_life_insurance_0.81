import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import globalStyle from '../../styles/globalStyle';

interface SummaryTableProps {
  data: any;
  projectsUnfiltered: Array<{ label: string; value: string }>;
  code: string;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data, projectsUnfiltered, code }) => {
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
      <Text style={[globalStyle.fontMedium, styles.subtitle]}>Code Wise Collection Summary</Text>
      <Text style={[globalStyle.fontMedium, styles.codeInfo]}>Code No: {code}</Text>

      {Object.keys(data).map((project, projectIndex) => (
        <View key={projectIndex}>
          <Text style={[globalStyle.fontMedium, styles.yearHeader, { textAlign: 'center' }]}>
            Project: {getProjectLabel(project)}
          </Text>

          {Object.keys(data[project]?.data || {}).map((year, yearIndex) => (
            <View key={yearIndex}>
              <Text style={[globalStyle.fontMedium, styles.yearHeader]}>{year}</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Month</Text>
                <Text style={styles.headerCell}>Type</Text>
                <Text style={styles.headerCell}>Amount</Text>
                <Text style={styles.headerCell}>No of Trns.</Text>
              </View>

              {Object.keys(data[project].data[year]?.data || {}).map((month, monthIndex) => {
                const monthData = data[project].data[year].data[month];
                return (
                  <View key={monthIndex}>
                    <View style={styles.row}>
                      <Text style={styles.cell}>{month}</Text>
                      <Text style={styles.cell}>Deferred</Text>
                      <Text style={styles.cell}>{monthData.deffered || '0.00'}</Text>
                      <Text style={styles.cell}>{monthData.deffered_count || 0}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.cell}></Text>
                      <Text style={styles.cell}>Renewal</Text>
                      <Text style={styles.cell}>{monthData.total || '0.00'}</Text>
                      <Text style={styles.cell}>{monthData.total_count || 0}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.cell}></Text>
                      <Text style={styles.cell}>Total</Text>
                      <Text style={styles.cell}>{monthData.total || '0.00'}</Text>
                      <Text style={styles.cell}>{monthData.total_count || 0}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          {/* Project Totals */}
          <View style={styles.totals}>
            <View style={styles.row}>
              <Text style={styles.cell}>Deferred Collection</Text>
              <Text style={styles.cell}>{data[project]?.deffered_total || '0.00'}</Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cell}></Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cell}>Renewal Collection</Text>
              <Text style={styles.cell}>{data[project]?.total || '0.00'}</Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cell}></Text>
            </View>
            <View style={[styles.row, styles.grandTotal]}>
              <Text style={styles.cell}>Grand Total</Text>
              <Text style={styles.cell}>{data[project]?.total || '0.00'}</Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cell}></Text>
            </View>
          </View>
        </View>
      ))}

      {/* Overall Totals */}
      {Object.keys(data).length > 1 && (
        <View style={styles.overallTotals}>
          <Text style={[globalStyle.fontBold, styles.overallTitle]}>
            Overall Totals for All Projects
          </Text>
          <View style={styles.totals}>
            <View style={styles.row}>
              <Text style={styles.cell}>Grand Total</Text>
              <Text style={styles.cell}>
                {Object.values(data).reduce((sum: number, project: any) => sum + parseFloat(project?.total || 0), 0).toFixed(2)}
              </Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cell}></Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderWidth: 2, borderColor: '#5382AC', marginVertical: 15, backgroundColor: '#fff' },
  title: { textAlign: 'center', fontSize: 18, marginVertical: 10 },
  subtitle: { textAlign: 'center', fontSize: 16, marginBottom: 5 },
  codeInfo: { textAlign: 'center', fontSize: 14, marginBottom: 10 },
  yearHeader: { fontSize: 18, fontFamily: globalStyle.fontBold.fontFamily, marginVertical: 10, marginLeft: 10 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderColor: '#5382AC', backgroundColor: '#F0F8FF' },
  headerCell: { flex: 1, textAlign: 'center', padding: 5, fontFamily: globalStyle.fontBold.fontFamily },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#5382AC' },
  cell: { flex: 1, textAlign: 'center', padding: 5, fontFamily: globalStyle.fontMedium.fontFamily },
  totals: { marginTop: 10, borderTopWidth: 2, borderColor: '#5382AC' },
  grandTotal: { backgroundColor: '#D3D3D3' },
  overallTotals: { marginTop: 20 },
  overallTitle: { textAlign: 'center', fontSize: 18, marginBottom: 10 },
  noData: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
});

export default SummaryTable;