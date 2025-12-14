// src/components/MenuComponent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet, ImageSourcePropType } from 'react-native';
import globalStyle from '../styles/globalStyle';

const { width, height } = Dimensions.get('window');

interface MenuComponentProps {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  zoomOut?: boolean;
}

const MenuComponent: React.FC<MenuComponentProps> = ({ icon, title, onPress, zoomOut }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image
        source={icon}
        style={[
        styles.icon,
          zoomOut && styles.zoomOutIcon
        ]}
      resizeMode={zoomOut ? 'contain' : 'cover'}
      />
      <Text style={[globalStyle.font, {textAlign: 'center'}]} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.12,
    width: '32%',
    backgroundColor: 'white',
    alignItems: 'center',
    marginVertical: 20,
  },
  icon: {
    height: '80%',
    width: '80%',
    marginBottom: 5,
    borderRadius: 15,
    borderWidth: 1,          
    borderColor: '#000',     
    overflow: 'hidden',
  },
  title: {
    textAlign: 'center',
    fontSize: 13,
    paddingHorizontal: 5,
  },
  zoomOutIcon: {
    width: '80%',
    height: '80%',
  },
});

export default MenuComponent;