import { useEffect } from 'react';
import { router, usePathname } from 'expo-router';
import { View, Text } from 'react-native';

export default function LoginRedirect() {
  const currentPath = usePathname();
  
  useEffect(() => {
    console.log('🔄 LoginRedirect component loaded');
    console.log('📍 Current path in LoginRedirect:', currentPath);
    console.log('🎯 About to redirect to /(auth)/login');
    
    const timer = setTimeout(() => {
      console.log('⏰ Executing redirect to /(auth)/login');
      router.replace('/(auth)/login');
    }, 500); // Small delay to see if this component is actually loading
    
    return () => clearTimeout(timer);
  }, [currentPath]);

  // Show something temporarily so we can see if this component loads
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Redirecting to login...</Text>
    </View>
  );
}
