import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

export type PaymentMethod = 'bkash' | 'nagad' | 'ssl';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const gatewayOptions: Array<{ value: PaymentMethod; image: any }> = [
  { value: 'bkash', image: require('../assets/bkash.png') },
  { value: 'nagad', image: require('../assets/nagad.png') },
  { value: 'ssl', image: require('../assets/otherCards.png') },
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedMethod, onSelect }) => {
  return (
    <View style={styles.container}>
      {gatewayOptions.map((item) => {
        const isSelected = selectedMethod === item.value;

        return (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.row,
              isSelected && styles.selectedRow,
            ]}
            onPress={() => onSelect(item.value)}
            activeOpacity={0.8}
          >
            {/* Radio Button */}
            <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
              {isSelected && <View style={styles.radioDot} />}
            </View>

            <View style={styles.spacer} />

            {/* Logo Only */}
            <Image source={item.image} style={styles.image} resizeMode="contain" />

            <View style={styles.spacer} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
  },
  row: {
    width: '100%',
    height: 55,                    
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#e2e2e2',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  selectedRow: {
    borderColor: '#EE4E89',
    backgroundColor: '#FFFBFD',
    elevation: 5,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#EE4E89',
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#EE4E89',
  },
  spacer: {
    flex: 1,  
  },
  image: {
    width: 108,        
    height: 44,        
  },
});

export default PaymentMethodSelector;