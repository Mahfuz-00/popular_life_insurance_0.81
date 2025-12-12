import React, { useState } from 'react';
import { View, ImageBackground, ScrollView, Alert  } from 'react-native';
import { Input } from '../../components/input/Input';
import { FilledButton } from '../../components/FilledButton';
import { PickerComponent } from '../../components/PickerComponent';
import { DatePickerComponent } from '../../components/DatePickerComponent';
import Header from '../../components/Header';
import globalStyle from '../../styles/globalStyle';
import BackgroundImage from '../../assets/BackgroundImage.png';

const claimTypes = [
  { value: 'Death Claim', label: 'Death Claim' },
  { value: 'Survival Benefit', label: 'Survival Benefit (SB)' },
];

const ClaimSubmissionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [policyNo, setPolicyNo] = useState('');
  const [claimType, setClaimType] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [dateOfIncident, setDateOfIncident] = useState(new Date());
  const [remarks, setRemarks] = useState('');

  const handleSubmit = () => {
    Alert.alert('Claim submitted successfully!');
  };

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title="Online Claim" />
        <ScrollView style={globalStyle.wrapper}>
          <Input label="Policy No" value={policyNo} onChangeText={setPolicyNo} />
          <PickerComponent items={claimTypes} value={claimType} setValue={setClaimType} label="Claim Type" />
          <Input label="Claim Amount" value={claimAmount} onChangeText={setClaimAmount} keyboardType="numeric" />
          <DatePickerComponent date={dateOfIncident} setDate={setDateOfIncident} label="Date of Incident" />
          <Input label="Remarks" value={remarks} onChangeText={setRemarks} multiline />
          <FilledButton title="Submit Claim" style={{ backgroundColor: '#EE4E89', marginTop: 20 }} onPress={handleSubmit} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default ClaimSubmissionScreen;