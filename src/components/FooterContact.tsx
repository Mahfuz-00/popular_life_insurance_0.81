import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dynamic font size based on screen width (perfect scaling)
const dynamicFontSize = (baseSize: number): number => {
  const scale = SCREEN_WIDTH / 375; // 375 = standard iPhone width
  return Math.round(baseSize * scale);
};

const FooterContact: React.FC = () => {
  const callNumber = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
        Customer Care:{' '}
        <Text style={styles.number} onPress={() => callNumber('01713241807')}>
          01713241807
        </Text>
        {' , '}
        <Text style={styles.number} onPress={() => callNumber('01713372308')}>
          01713372308
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  text: {
    color: '#966EAF',
    fontSize: dynamicFontSize(16.5),
    fontWeight: '600',
    textAlign: 'center',
  },
  number: {
    color: '#966EAF',
    fontWeight: 'bold',
    fontSize: dynamicFontSize(17.5),
    textDecorationLine: 'underline',
  },
});

export default FooterContact;