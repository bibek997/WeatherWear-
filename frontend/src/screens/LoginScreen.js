import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { signInWithGoogle } from '../utils/googleAuth';

export default function LoginScreen({ onLogin }) {
  const handleGoogle = async () => {
    const user = await signInWithGoogle();
    if (user) onLogin(user);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WeatherWear</Text>
      <Text style={styles.sub}>Sign in to save your preferences</Text>
      <Button title="Sign in with Google" onPress={handleGoogle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold' },
  sub: { marginBottom: 20, color: '#555' },
});