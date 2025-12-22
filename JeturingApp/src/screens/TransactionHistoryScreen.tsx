import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TransactionHistoryScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Transaction History - Coming Soon</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#6b7280' },
});

export default TransactionHistoryScreen;
