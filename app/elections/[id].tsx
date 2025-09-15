import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ElectionDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Election Detail - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#6b7280',
  },
});