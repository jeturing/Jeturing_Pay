import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useStripeAccount } from '../contexts/StripeAccountContext';

const SettingsScreen = () => {
  const { account, logout } = useStripeAccount();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>
      <Text style={styles.text}>{account?.business_name}</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  text: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  button: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

export default SettingsScreen;
