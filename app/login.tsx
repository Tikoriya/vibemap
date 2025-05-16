import { authApi } from '@/lib/supabase/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
        await  authApi.login(email, password)
    }
    catch (error) {
      console.error('Login error:', error);
      // Handle login error (e.g., show an alert)
    }
  };

  const handleAppleSignIn = () => {
    // Implement Apple SSO logic here
  };

  const handleGoogleSignIn = () => {
    // Implement Google SSO logic here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.ssoContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleAppleSignIn}>
          <Text style={styles.secondaryButtonText}>Sign in with Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleGoogleSignIn}>
          <Text style={styles.secondaryButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signupContainer}>
        <Text>{"Don't have account yet? "} </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.signupText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: {
    width: 260,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  primaryButton: {
    width: 260,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ssoContainer: {
    marginTop: 0,
    width: '100%',
    gap: 8,
    alignItems: 'center', // <-- center the SSO buttons
    justifyContent: 'center',
  },
  secondaryButton: {
    width: 260,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupContainer: { flexDirection: 'row', marginTop: 32, alignItems: 'center' },
  signupText: { color: '#007AFF', fontWeight: 'bold' },
});
