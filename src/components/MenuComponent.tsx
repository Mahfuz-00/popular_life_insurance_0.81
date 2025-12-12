import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet, ImageSourcePropType } from 'react-native';
import globalStyle from '../styles/globalStyle';

const { width } = Dimensions.get('window'); 

interface MenuComponentProps {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
}

const MenuComponent: React.FC<MenuComponentProps> = ({ icon, title, ...props }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.iconWrapper}>
        <Image
          source={icon}
          style={styles.icon}
          resizeMode="cover" 
        />
      </View>

      <Text style={[globalStyle.font, styles.title]} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const componentWidth = width * 0.28;

const styles = StyleSheet.create({
  container: {
    width: componentWidth,
    height: componentWidth, 
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 20, 
    marginHorizontal: '0.5%', 
  },

  iconWrapper: {
    height: '80%', 
    width: '80%', 
    overflow: 'hidden',    
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 19,
    justifyContent: 'center', 
    alignItems: 'center',    
  },

  icon: {
    width: '100%',
    height: '100%',
    padding: 0,

    // --- SOFT SHADOW STYLES ADDED HERE ---
    // iOS Shadow properties
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, // Lower opacity for a softer look
    shadowRadius: 3,    // Higher radius for a softer, wider spread

    // Android Shadow property
    elevation: 5,
  },

  title: {
    textAlign: 'center',
    marginTop: 5, 
    fontSize: componentWidth * 0.1, 
  },
});

export default MenuComponent;