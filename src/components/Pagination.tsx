import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import globalStyle from '../styles/globalStyle';
import { PRIMARY_BUTTON_BG } from '../store/constants/colorConstants';

type PaginationProps = {
  totalPages: number | string;
  currentPage: string;                    
  setCurrentPage: (page: string) => void; 
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, setCurrentPage }) => {
  const total = Number(totalPages);
  const current = Number(currentPage);

  const buttons = [];

  for (let i = 1; i <= total; i++) {
    buttons.push(
      <TouchableOpacity
        key={i}
        style={{
          backgroundColor: current === i ? PRIMARY_BUTTON_BG : 'grey',
          marginRight: 10,
          padding: 10,
          height: 40,
          width: 50,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => setCurrentPage(i.toString())} // ← Send string → matches your state
      >
        <Text style={[globalStyle.fontMedium, { color: '#FFF' }]}>{i}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ height: 70, justifyContent: 'center' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
          {buttons}
        </View>
      </ScrollView>
    </View>
  );
};

export default Pagination;