import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../components/Header';
import globalStyle from '../../styles/globalStyle';

const { height } = Dimensions.get('window');

const productData = [
  {
    ProductName: 'Hajj Bima Plan',
    ProductImage: require('../../assets/products/1.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/BYEeEGao6o8i.jpg',
  },
  {
    ProductName: 'Assurance cum Pension and Medical Benefit plan',
    ProductImage: require('../../assets/products/2.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/V8m6XtdA4FCc.jpg',
  },
  {
    ProductName: 'DPS',
    ProductImage: require('../../assets/products/3.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/k5EYFolEtQ2A.jpg',
  },
  {
    ProductName: 'Child-Protection-Assurance-Plan',
    ProductImage: require('../../assets/products/4.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/wJLJ7xi4oqjt.jpg',
  },
  {
    ProductName: 'Double Payment Single Premium Policy',
    ProductImage: require('../../assets/products/5.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/CcUgzK3Syzvh.png',
  },
  {
    ProductName: 'Education Expense Assurance Plan',
    ProductImage: require('../../assets/products/6.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/vN3DumS0m320.jpg',
  },
  {
    ProductName: 'Child-Scholarship-Assurance-Plan',
    ProductImage: require('../../assets/products/7.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/wJrWyGUkeY4f.png',
  },
  {
    ProductName: 'Endowment Assurance Plan',
    ProductImage: require('../../assets/products/8.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/MrcD4R3eiBjU.jpg',
  },
  {
    ProductName: 'Five-Payment-Endowment-Assurance-Plan',
    ProductImage: require('../../assets/products/9.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/wr8iDPmkq98d.jpg',
  },
  {
    ProductName: 'Four-Payment-Endowment-Assurance-Plan',
    ProductImage: require('../../assets/products/10.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/jt2PJ3XhSyll.jpg',
  },
  {
    ProductName: 'Mohorana-Bima-Plan',
    ProductImage: require('../../assets/products/11.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/HdSiTc0f2Xfz.jpg',
  },
  {
    ProductName: 'Money-Back-Term-Assurance-Plan',
    ProductImage: require('../../assets/products/12.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/xCF1tOliGRtd.jpg',
  },
  {
    ProductName: 'Single-Payment-Endowment-Assurance-Plan',
    ProductImage: require('../../assets/products/13.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/NflKDIzINziV.jpg',
  },
  {
    ProductName: 'Three-Payment-Endowment-Assurance-Plan',
    ProductImage: require('../../assets/products/14.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/7DldaN2f07iR.jpg',
  },
  {
    ProductName: 'Bi-Ennial',
    ProductImage: require('../../assets/products/15.png'),
    ProductDetailsUri: 'https://www.popularlifeins.com/images/test/4RA7YE5EfAAQ.jpg',
  },
];

type Product = {
  ProductName: string;
  ProductImage: any;
  ProductDetailsUri: string;
};

type ProductStackParamList = {
  Products: undefined;
  ProductDetails: { productDetailsUri: string };
};

const Stack = createNativeStackNavigator<ProductStackParamList>();

type ProductsScreenProps = NativeStackScreenProps<ProductStackParamList, 'Products'>;
type ProductDetailsScreenProps = NativeStackScreenProps<ProductStackParamList, 'ProductDetails'>;


const ProductInfoScreen: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
};

const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigation }) => {
  return (
    <View style={globalStyle.container}>
      <Header navigation={navigation} title={'Product Info'} />
      <ScrollView style={globalStyle.wrapper}>
        <View style={styles.container}>
          {productData.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.productCard}
              onPress={() =>
                navigation.navigate('ProductDetails', {
                  productDetailsUri: item.ProductDetailsUri,
                })
              }
            >
              <View style={styles.productImgWrapper}>
                <Image style={styles.productImg} source={item.ProductImage} resizeMode="cover" />
              </View>
              <Text style={[globalStyle.fontMedium, styles.productTitle]} numberOfLines={2}>
                {item.ProductName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({ route }) => {
  const { productDetailsUri } = route.params;

  return (
    <ScrollView style={[globalStyle.container, { marginVertical: 5 }]}>
      <Image
        source={{ uri: productDetailsUri }}
        resizeMode="contain"
        style={{ height, width: '100%' }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal:20,
    paddingVertical:10,
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent:'space-between'
  },
  productCard:{ 
    height:230,
    width:'48%',
    borderRadius:8,
    marginVertical:10,
    
    alignItems:'center',
  },
  productImgWrapper:{
    height:'80%',
    width:'100%'
  },
  productImg:{
    height:'100%',
    width:'100%',
    borderRadius: 15
  },
  productNumber:{
    color:'#fff',
    fontWeight:'bold',
    marginTop:10,
  },
  productTitle:{
    color:'#000',
    textAlign:'center',
    overflow:'hidden',
    marginTop: 5
  }
});

export default ProductInfoScreen;