import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, Dimensions, ImageSourcePropType, View } from 'react-native';
import globalStyle from '../styles/globalStyle';

const { width } = Dimensions.get('window');
const SIZE = width * 0.29;

interface MenuComponentProps {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
}

const MenuComponent: React.FC<MenuComponentProps> = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconWrapper}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      </View>
      <Text style={[globalStyle.font, styles.title]} numberOfLines={2} textBreakStrategy="simple">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: '62%',
    height: '62%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
    borderWidth: 1.2,
    borderColor: '#000',
    borderRadius: 16,
  },
  title: {
    fontSize: 12.5,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
    marginTop: 6,
    paddingHorizontal: 4,
  },
});

export default MenuComponent;