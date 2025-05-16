import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { initAuth } from '@/utils/initAuth';
import { useEffect } from 'react';
const queryClient = new QueryClient();


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    initAuth();
  }, []);
  
  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
       {/* {user ? <MainStack /> : <AuthStack />}
        <StatusBar style="auto" /> */}
        <Slot />
     </ThemeProvider>
    </QueryClientProvider>
  );
}