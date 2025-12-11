import React from 'react';
import { View, Text, ScrollView, ImageBackground, Image, Dimensions, StyleSheet } from 'react-native';
import Header from '../components/Header';
import globalStyle from '../styles/globalStyle';
import BackgroundImage from '../assets/background-full.png';

const { width } = Dimensions.get('window');

const MessageFromMd: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={globalStyle.container}>
      <ImageBackground source={BackgroundImage} style={styles.bg}>
        <Header navigation={navigation} title="Message from CEO" />
        <ScrollView style={globalStyle.wrapper}>
          <View style={styles.mdContainer}>
            <View style={styles.imageWrapper}>
              <Image source={require('../assets/md.jpg')} style={styles.mdImage} />
            </View>
            <Text style={styles.message}>
              Popular Life Insurance Company Ltd is a leading and prominent life insurance company...
              {/* Full message remains same */}
            </Text>
            </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  mdContainer: { alignItems: 'center', padding: 20 },
  imageWrapper: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: '#DEA5CA',
    elevation: 10,
  },
  mdImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  message: {
    ...globalStyle.fontMedium,
    color: '#FFF',
    textAlign: 'justify',
    lineHeight: 24,
    marginTop: 20,
  },
});

export default MessageFromMd;