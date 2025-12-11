import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/index';

const Loading: React.FC = () => {
  const { loading } = useSelector((state: RootState) => state.loading);

  if (!loading) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color="#966EAF" />
        <Text style={styles.text}>Please wait...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  box: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
  },
  text: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default Loading;