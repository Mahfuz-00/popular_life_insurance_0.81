import React, { useState } from 'react';
import { View, Text, ImageBackground, ScrollView, StyleSheet, Alert } from 'react-native'; 
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { getAuthPolicyDetails } from '../../actions/userActions';
import Header from '../../components/Header';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { DatePickerComponent } from '../../components/DatePickerComponent';
import globalStyle from '../../styles/globalStyle';
import BackgroundImage from '../../assets/BackgroundImage.png';

const AuthPolicyInfoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [policyNumber, setPolicyNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null); 
  const [policyDetails, setPolicyDetails] = useState<any>(null);

  const handleSubmit = async () => {
    const res = await dispatch(getAuthPolicyDetails({
      policyNo: policyNumber,
      dob: dateOfBirth ? moment(dateOfBirth).format('YYYY-MM-DD') : '',
    }) as any);

    if (res?.data?.name) {
      setPolicyDetails(res.data);
    } else {
      Alert.alert('Invalid', 'Invalid Policy Number or Date of Birth'); 
    }
  };

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title="Policy Information" />
        <ScrollView style={globalStyle.wrapper}>
          <Input label="Policy Number" value={policyNumber} onChangeText={setPolicyNumber} />
          <DatePickerComponent 
            date={dateOfBirth} 
            setDate={setDateOfBirth} 
            label="Date of Birth" 
          />
          <FilledButton title="Submit" style={styles.button} onPress={handleSubmit} />

          {policyDetails && (
            <View style={styles.table}>
              {['name', 'plan', 'tarm', 'sumAssured', 'totalPremium', 'mode'].map((key) => (
                <View key={key} style={styles.row}>
                  <Text style={styles.label}>{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                  <Text style={styles.value}>
                    {key.includes('sum') || key.includes('total') 
                      ? Number(policyDetails[key]).toLocaleString() 
                      : policyDetails[key]}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  button: { backgroundColor: '#EE4E89', width: '50%', alignSelf: 'center', marginVertical: 20 },
  table: { borderWidth: 2, borderColor: '#5382AC', marginTop: 20 },
  row: { flexDirection: 'row', borderBottomWidth: 2, borderColor: '#5382AC' },
  label: { flex: 1, textAlign: 'center', padding: 10, backgroundColor: '#f0f0f0' },
  value: { flex: 1, textAlign: 'center', padding: 10 },
});

export default AuthPolicyInfoScreen;