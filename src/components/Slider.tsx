import React, { useState } from 'react';
import { 
    View, 
    ScrollView, 
    Image, 
    Dimensions, 
    StyleSheet, 
    ImageSourcePropType,
    Text
 } from 'react-native';

const { width } = Dimensions.get('window');
const height = width * 0.5;

interface SliderProps {
  images?: ImageSourcePropType[];
}

const Slider: React.FC<SliderProps> = ({ images = [] }) => {
  const [active, setActive] = useState(0);

  const handleScroll = (event: any) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / width);
    if (slide !== active) setActive(slide);
  };

  if (images.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((img, i) => (
          <Image key={i} source={img} style={styles.image} resizeMode="cover" />
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {images.map((_, i) => (
          <Text key={i} style={i === active ? styles.activeDot : styles.dot}>
            ●
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  image: { width, height },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: { color: '#ccc', fontSize: 20, marginHorizontal: 4 },
  activeDot: { color: '#fff', fontSize: 22 },
});

export default Slider;