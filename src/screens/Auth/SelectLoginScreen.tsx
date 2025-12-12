import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

import iconProducer from '../../assets/icon-producer.png';

type SelectLoginScreenProps = {
  navigation: any;
};

const SelectLoginScreen: React.FC<SelectLoginScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btnContainer}
        onPress={() => navigation.navigate('Login')} 
      >
        <View style={styles.icon}>
          <Image style={styles.iconImg} source={iconProducer} />
        </View>
        <Text style={styles.iconText}>Producer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnContainer}
        onPress={() => navigation.navigate('Login')} 
      >
        <View style={styles.icon}>
          <Image style={styles.iconImg} source={iconProducer} />
        </View>
        <Text style={styles.iconText}>Policy Holder</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  btnContainer: {
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    width: 200,
    backgroundColor: '#72BE44',
    marginVertical: 20,
  },
  icon: {
    height: 100,
    width: 100,
  },
  iconImg: {
    height: '100%',
    width: '100%',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SelectLoginScreen;