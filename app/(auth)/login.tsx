import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Simple login - just redirect for now
    router.replace('/(tabs)/elections');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', padding: 20 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 }}>
          Login
        </Text>
        
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Email or NIN</Text>
          <TextInput
            style={{ 
              borderWidth: 1, 
              borderColor: '#d1d5db', 
              borderRadius: 8, 
              padding: 12, 
              backgroundColor: 'white' 
            }}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email or NIN"
          />
        </View>
        
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Password</Text>
          <TextInput
            style={{ 
              borderWidth: 1, 
              borderColor: '#d1d5db', 
              borderRadius: 8, 
              padding: 12, 
              backgroundColor: 'white' 
            }}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />
        </View>
        
        <Pressable
          onPress={handleLogin}
          style={{
            backgroundColor: '#2563eb',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Sign In
          </Text>
        </Pressable>
      </View>
    </View>
  );
}