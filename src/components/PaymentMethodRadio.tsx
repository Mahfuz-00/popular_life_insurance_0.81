import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

export type PaymentMethod = 'bkash' | 'nagad' | 'ssl';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const gatewayOptions: PaymentMethod[] = ['bkash', 'nagad', 'ssl'];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedMethod, onSelect }) => {
  const getImage = (method: PaymentMethod) => {
    switch (method) {
      case 'bkash':
        return require('../assets/bkash.png');
      case 'nagad':
        return require('../assets/nagad.png');
      case 'ssl':
        return require('../assets/otherCards.png');
    }
  };

  return (
    <View style={styles.container}>
      {gatewayOptions.map(method => (
        <TouchableOpacity
          key={method}
          style={[
            styles.wrapper,
            selectedMethod === method ? styles.selected : {},
          ]}
          onPress={() => onSelect(method)}
          activeOpacity={0.7}
        >
          <Image source={getImage(method)} style={styles.image} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  wrapper: {
    padding: 5,
    borderRadius: 5,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#EE4E89',
  },
  image: {
    width: 80,
    height: 35,
    resizeMode: 'contain',
  },
});

export default PaymentMethodSelector;
