// src/components/reports/DetailsTable.tsx
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
    return (
      <Text style={[globalStyle.fontMedium, styles.noData]}>
        No data found for current year
      </Text>
    );
  }

  const getProjectLabel = (projectCode: string) => {
    const project = projectsUnfiltered.find(p => p.value === projectCode);
    return project ? project.label : projectCode;
  };

  // Calculate project totals (even if zero)
  const calculateProjectTotals = (projectData: any) => {
    let deferredAmount = 0;
    let deferredCount = 0;
    let renewalAmount = 0;
    let renewalCount = 0;

    Object.keys(projectData?.data || {}).forEach(year => {
      Object.keys(projectData.data[year]?.data || {}).forEach(month => {
        const monthData = projectData.data[year].data[month];
        (monthData?.data || []).forEach((txn: any) => {
          const amount = parseFloat(txn.amount || 0);
          if (txn.type === 'D') {
            deferredAmount += amount;
            deferredCount += 1;
          } else if (txn.type === 'R') {
            renewalAmount += amount;
            renewalCount += 1;
          }
        });
      });
    });

    return {
      deferredAmount,
      deferredCount,
      renewalAmount,
      renewalCount,
      grandTotal: deferredAmount + renewalAmount,
      grandCount: deferredCount + renewalCount,
    };
  };

  // Calculate overall totals
  const calculateOverallTotals = () => {
    let deferredAmount = 0;
    let deferredCount = 0;
    let renewalAmount = 0;
    let renewalCount = 0;

    Object.keys(data).forEach(project => {
      if (!Array.isArray(data[project])) {
        const totals = calculateProjectTotals(data[project]);
        deferredAmount += totals.deferredAmount;
        deferredCount += totals.deferredCount;
        renewalAmount += totals.renewalAmount;
        renewalCount += totals.renewalCount;
      }
    });

    return {
      deferredAmount,
      deferredCount,
      renewalAmount,
      renewalCount,
      grandTotal: deferredAmount + renewalAmount,
      grandCount: deferredCount + renewalCount,
    };
  };

  const overallTotals = calculateOverallTotals();

  return (
    <View style={styles.container}>
      <Text style={[globalStyle.fontBold, styles.title]}>Popular Life Insurance Co.Ltd.</Text>
      <Text style={[globalStyle.fontMedium, styles.subtitle]}>Code Wise Collection Details</Text>
      <Text style={[globalStyle.fontMedium, styles.codeInfo]}>Code No: {code}</Text>

      {Object.keys(data).map((project, projectIndex) => {
        const projectData = data[project];
        const projectTotals = calculateProjectTotals(projectData);

        return (
          <View key={projectIndex} style={styles.projectBlock}>
            <Text style={[globalStyle.fontMedium, styles.yearHeader, { textAlign: 'center' }]}>
              Project: {getProjectLabel(project)}
            </Text>

            {Object.keys(projectData?.data || {}).length === 0 ? (
              <Text style={[globalStyle.fontMedium, styles.noDataYear]}>
                No data found for current year
              </Text>
            ) : (
              Object.keys(projectData.data).map((year, yearIndex) => (
                <View key={yearIndex}>
                  <Text style={[globalStyle.fontMedium, styles.yearHeader]}>{year}</Text>

                  {Object.keys(projectData.data[year]?.data || {}).map((month, monthIndex) => {
                    const monthData = projectData.data[year].data[month];
                    const transactions = monthData?.data || [];

                    return (
                      <View key={monthIndex}>
                        <Text style={[globalStyle.fontMedium, styles.monthHeader]}>{month}</Text>
                        <View style={styles.tableHeader}>
                          <Text style={styles.headerCell}>Trns. No</Text>
                          <Text style={styles.headerCell}>Amount</Text>
                          <Text style={styles.headerCell}>D/R</Text>
                          <Text style={styles.headerCell}>Date</Text>
                        </View>

                        {transactions.length === 0 ? (
                          <View style={styles.row}>
                            <Text style={[styles.cell, styles.fullWidthCell]}>
                              No transactions
                            </Text>
                          </View>
                        ) : (
                          transactions.map((txn: any, idx: number) => (
                            <View style={styles.row} key={idx}>
                              <Text style={styles.cell}>{txn.transaction_no || 'N/A'}</Text>
                              <Text style={styles.cell}>{txn.amount || '0.00'}</Text>
                              <Text style={styles.cell}>{txn.type || 'N/A'}</Text>
                              <Text style={styles.cell}>
                                {txn.date ? moment(txn.date.original).format('DD-MM-YYYY') : 'N/A'}
                              </Text>
                            </View>
                          ))
                        )}

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
              ))
            )}

            {/* Always show project totals, even if zero */}
            <View style={styles.totals}>
              <View style={styles.row}>
                <Text style={styles.cell}>Deferred Collection</Text>
                <Text style={styles.cell}>{projectTotals.deferredAmount.toFixed(2)}</Text>
                <Text style={styles.cell}>{projectTotals.deferredCount}</Text>
                <Text style={styles.cell}></Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cell}>Renewal Collection</Text>
                <Text style={styles.cell}>{projectTotals.renewalAmount.toFixed(2)}</Text>
                <Text style={styles.cell}>{projectTotals.renewalCount}</Text>
                <Text style={styles.cell}></Text>
              </View>
              <View style={[styles.row, styles.grandTotal]}>
                <Text style={styles.cell}>Grand Total</Text>
                <Text style={styles.cell}>{projectTotals.grandTotal.toFixed(2)}</Text>
                <Text style={styles.cell}></Text>
                <Text style={styles.cell}></Text>
              </View>
            </View>
          </View>
        );
      })}

      {/* Overall Totals */}
      {Object.keys(data).length > 1 && (
        <>
          <Text style={[globalStyle.fontBold, styles.overallTitle]}>
            Overall Totals for All Projects
          </Text>
          <View style={styles.totals}>
            <View style={styles.row}>
              <Text style={styles.cell}>Deferred Collection</Text>
              <Text style={styles.cell}>{overallTotals.deferredAmount.toFixed(2)}</Text>
              <Text style={styles.cell}>{overallTotals.deferredCount}</Text>
              <Text style={styles.cell}></Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cell}>Renewal Collection</Text>
              <Text style={styles.cell}>{overallTotals.renewalAmount.toFixed(2)}</Text>
              <Text style={styles.cell}>{overallTotals.renewalCount}</Text>
              <Text style={styles.cell}></Text>
            </View>
            <View style={[styles.row, styles.grandTotal]}>
              <Text style={styles.cell}>Grand Total</Text>
              <Text style={styles.cell}>{overallTotals.grandTotal.toFixed(2)}</Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cell}></Text>
            </View>
          </View>
        </>
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
  monthHeader: { fontSize: 16, marginVertical: 10, marginLeft: 10 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderColor: '#5382AC', backgroundColor: '#F0F8FF' },
  headerCell: { flex: 1, textAlign: 'center', padding: 5, fontFamily: globalStyle.fontBold.fontFamily },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#5382AC' },
  cell: { flex: 1, textAlign: 'center', padding: 5, fontFamily: globalStyle.fontMedium.fontFamily },
  subTotal: { backgroundColor: '#E6E6FA' },
  totals: { marginTop: 10, borderTopWidth: 2, borderColor: '#5382AC' },
  grandTotal: { backgroundColor: '#D3D3D3' },
  overallTitle: { textAlign: 'center', fontSize: 18, marginVertical: 20 },
  noData: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
  noDataYear: { textAlign: 'center', marginVertical: 20, fontSize: 16, color: '#888' },
  fullWidthCell: {flex: 0, width: '100%', textAlign: 'center', },
  projectBlock: { marginBottom: 40,  paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#ccc',},
});

export default DetailsTable;