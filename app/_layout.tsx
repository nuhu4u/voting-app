import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="elections/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="results/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="vote/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="vote-position" options={{ headerShown: false }} />
        <Stack.Screen name="vote-position/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="vote-position/level-detail/[level]" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard/page" options={{ headerShown: false }} />
        <Stack.Screen name="profile/page" options={{ headerShown: false }} />
        <Stack.Screen name="blockchain-transactions" options={{ headerShown: false }} />
        <Stack.Screen name="election-totals" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
