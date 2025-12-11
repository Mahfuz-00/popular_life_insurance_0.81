import React, { useState, useEffect, useRef } from 'react';
import { View, ImageBackground, ScrollView, StyleSheet } from 'react-native';
import { Input } from '../components/Input';
import { FilledButton } from '../components/FilledButton';
import { PickerComponent } from '../components/PickerComponent';
import { DatePickerComponent } from '../components/DatePickerComponent';
import Header from '../components/Header';
import globalStyle from '../styles/globalStyle';
import BackgroundImage from '../assets/BackgroundImage.png';

const RelationOptions = [ /* same as before */ ];
const educationOptions = [ /* same as before */ ];

const ApplyOnlineScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const firstRender = useRef(true);
  const [dateOfBirth, setDateOfBirth] = useState(new Date('1990-01-01'));
  const [premium, setPremium] = useState(route.params?.premium || '');

  // All your state fields
  const [plan, setPlan] = useState('');
  const [term, setTerm] = useState('');
  const [mode, setMode] = useState('');
  const [sumAssured, setSumAssured] = useState('');
  const [idType, setIdType] = useState('');
  const [proposersName, setProposersName] = useState('');
  // ... others

  useEffect(() => {
    if (!firstRender.current) setPremium('');
  }, [dateOfBirth, plan, term, mode, sumAssured]);

  useEffect(() => { firstRender.current = false; }, []);

  const getPremium = () => setPremium('1000');

  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={{ flex: 1 }}>
        <Header navigation={navigation} title="Apply for Policy" />
        <ScrollView style={globalStyle.wrapper}>
          {/* All your inputs & pickers */}
          <FilledButton title="GET PREMIUM" style={styles.button} onPress={getPremium} />
          {premium && (
            <>
              {/* All form fields */}
              <FilledButton title="SUBMIT" style={styles.button} onPress={() => {}} />
            </>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  button: { marginVertical: 15, backgroundColor: '#EE4E89', borderRadius: 50 },
});

export default ApplyOnlineScreen;