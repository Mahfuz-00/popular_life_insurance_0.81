import React from 'react';
import { View, Text, ScrollView, Image, Dimensions } from 'react-native';
import Header from '../../components/Header';
import globalStyle from '../../styles/globalStyle';
import { FilledButton } from '../../components/FilledButton';

const { width, height } = Dimensions.get('window');

type ContactUsScreenProps = {
  navigation: any;
};

const ContactUsScreen: React.FC<ContactUsScreenProps> = ({ navigation }) => {
  return (
    <View style={[globalStyle.container, { backgroundColor: '#D5EDE3' }]}>
      <Header navigation={navigation} title={'Contact Us'} />
      <ScrollView>
        <Image
          style={{
            height: height * 0.3,
            width: '100%',
            padding: 10,
            marginVertical: 20,
          }}
          source={require('../../assets/maps.jpg')}
        />

        <FilledButton
          title={'Get Direction'}
          style={{ width: '80%', alignSelf: 'center', marginVertical: 10 }}
        />

        <Text
          style={[
            globalStyle.fontMedium,
            { textAlign: 'justify', marginVertical: 10, marginHorizontal: '10%', fontSize: 16 },
          ]}
        >
          36, Dilkusha C/A, Peoples Insurance Bhaban (17th Floor) Dhaka -1000, Tel: 9577534-38
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '80%',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: 20,
          }}
        >
          <Image source={require('../../assets/fb.png')} />
          <Image source={require('../../assets/p.png')} />
          <Image source={require('../../assets/youtube.png')} />
          <Image source={require('../../assets/c.png')} />
        </View>
      </ScrollView>
    </View>
  );
};

export default ContactUsScreen;