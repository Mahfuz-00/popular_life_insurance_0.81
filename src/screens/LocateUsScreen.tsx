import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import globalStyle from '../styles/globalStyle';
import Header from '../components/Header';

const LocateUsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} title="Locate Us" />
      <View style={styles.content}>
        <Text style={styles.title}>Find Our Branches</Text>
        <Text style={styles.comingSoon}>Coming Soon...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#EE4E89', marginBottom: 10 },
  comingSoon: { fontSize: 18, color: '#666' },
});

export default LocateUsScreen;