import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="elections"
        options={{
          title: 'Elections',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ballot" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
