import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { CalSans_400Regular } from '@expo-google-fonts/cal-sans';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { SplashOverlay } from './src/components/SplashOverlay';
import { FirstRun, loadFirstRun } from './src/lib/storage';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { colors } from './src/theme/tokens';

/** The splash is shown at least this long, even when everything loads faster (so the wordmark can be read). */
const SPLASH_MS = 1500;

// Dark theme for React Navigation: the screen background shows between transitions, so it must be navy rather than the default white.
const NAV_THEME: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, text: colors.textPrimary, border: colors.border, primary: colors.accent },
};

function Root({ minElapsed }: { minElapsed: boolean }) {
  const { status } = useAuth();
  const [firstRun, setFirstRun] = useState<FirstRun>();

  // Whether onboarding and the location screen were seen: read together with the session, while the splash covers the app.
  useEffect(() => {
    let alive = true;
    loadFirstRun().then((f) => alive && setFirstRun(f));
    return () => {
      alive = false;
    };
  }, []);

  const ready = status !== 'loading' && firstRun !== undefined;
  return (
    <>
      {ready ? (
        <NavigationContainer theme={NAV_THEME}>
          {status === 'signedIn' ? <AppNavigator /> : <AuthNavigator firstRun={firstRun} />}
          <StatusBar style="light" />
        </NavigationContainer>
      ) : null}
      <SplashOverlay visible={!ready || !minElapsed} />
    </>
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

  // Counted from launch, not from the fonts: a slow font load already used part of the splash time.
  const [minElapsed, setMinElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaProvider>
      {fontsLoaded ? (
        <AuthProvider>
          <Root minElapsed={minElapsed} />
        </AuthProvider>
      ) : (
        // Fonts first: the splash without its text, so the wordmark never shows in a fallback font.
        <SplashScreen bare />
      )}
    </SafeAreaProvider>
  );
}
