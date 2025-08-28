import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SF-Pro-Rounded-Regular': require('../assets/fonts/SF-Pro-Rounded-Regular.otf'),
    'SF-Pro-Rounded-Bold': require('../assets/fonts/SF-Pro-Rounded-Bold.otf'),
    'SF-Pro-Rounded-Semibold': require('../assets/fonts/SF-Pro-Rounded-Semibold.otf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar barStyle="light-content" />
    </ThemeProvider>
  );
}
