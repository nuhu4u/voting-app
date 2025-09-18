import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { electionService } from '@/lib/api/election-service';
import { votePositionService } from '@/lib/api/vote-position-service';

export const TestApiConnection = () => {
  const [testing, setTesting] = useState(false);

  const testElectionsApi = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testing Elections API...');
      const response = await electionService.getElections();
      console.log('🧪 Elections API Response:', response);
      
      Alert.alert(
        'Elections API Test',
        `Success: ${response.success}\nMessage: ${response.message}\nData Count: ${response.data?.length || 0}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('🧪 Elections API Error:', error);
      Alert.alert('Elections API Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setTesting(false);
    }
  };

  const testVotePositionApi = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testing Vote Position API...');
      const response = await votePositionService.getVotePositionData('test-election-id');
      console.log('🧪 Vote Position API Response:', response);
      
      Alert.alert(
        'Vote Position API Test',
        `Success: ${response.success}\nMessage: ${response.message}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('🧪 Vote Position API Error:', error);
      Alert.alert('Vote Position API Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, testing && styles.buttonDisabled]} 
        onPress={testElectionsApi}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing...' : 'Test Elections API'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, testing && styles.buttonDisabled]} 
        onPress={testVotePositionApi}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing...' : 'Test Vote Position API'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
