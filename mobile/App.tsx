import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { CalSans_400Regular } from '@expo-google-fonts/cal-sans';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { LoadingScreen } from './src/components/LoadingScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { colors } from './src/theme/tokens';

const SPLASH_MS = 1500;

// Dark theme for React Navigation: the screen background shows between transitions, so it must be navy rather than the default white.
const NAV_THEME: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, text: colors.textPrimary, border: colors.border, primary: colors.accent },
};

function Root() {
  const { status } = useAuth();
  if (status === 'loading') return <LoadingScreen />;
  return (
    <NavigationContainer theme={NAV_THEME}>
      {status === 'signedIn' ? <AppNavigator /> : <AuthNavigator />}
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    CalSans_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [splashDone, setSplashDone] = useState(false);

  // The splash counts from the moment the fonts are ready (its wordmark needs them) and covers the app while the session loads behind it.
  useEffect(() => {
    if (!fontsLoaded) return;
    const t = setTimeout(() => setSplashDone(true), SPLASH_MS);
    return () => clearTimeout(t);
  }, [fontsLoaded]);

  return (
    <SafeAreaProvider>
      {fontsLoaded ? (
        <>
          <AuthProvider>
            <Root />
          </AuthProvider>
          {splashDone ? null : (
            <View style={StyleSheet.absoluteFill}>
              <SplashScreen />
            </View>
          )}
        </>
      ) : (
        <LoadingScreen />
      )}
    </SafeAreaProvider>
  );
}
