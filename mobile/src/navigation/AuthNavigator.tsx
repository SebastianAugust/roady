import { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { FirstRun, loadFirstRun, markLocationPromptSeen, markOnboardingSeen } from '../lib/storage';
import { LocationPermissionScreen } from '../screens/LocationPermissionScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import type { AuthScreenProps, AuthStackParamList } from './types';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator<AuthStackParamList>();

function OnboardingRoute({ navigation }: AuthScreenProps<'Onboarding'>) {
  const finish = async () => {
    await markOnboardingSeen();
    navigation.replace('Permission');
  };
  return <OnboardingScreen onFinish={() => void finish()} />;
}

function PermissionRoute({ navigation }: AuthScreenProps<'Permission'>) {
  const done = async () => {
    await markLocationPromptSeen();
    navigation.replace('Login');
  };
  return <LocationPermissionScreen onDone={() => void done()} />;
}

function LoginRoute({ navigation }: AuthScreenProps<'Login'>) {
  const { signIn } = useAuth();
  return <LoginScreen onSuccess={signIn} onGoToSignUp={() => navigation.navigate('SignUp')} />;
}

function SignUpRoute({ navigation }: AuthScreenProps<'SignUp'>) {
  const { signIn } = useAuth();
  return <SignUpScreen onSuccess={signIn} onGoToLogin={() => navigation.goBack()} />;
}

/**
 * Shown while nobody is signed in: Onboarding and the location permission screen on first use, then Login and Sign up.
 * Signing in swaps this whole navigator for the app one.
 */
export function AuthNavigator() {
  const [firstRun, setFirstRun] = useState<FirstRun>();

  useEffect(() => {
    let alive = true;
    loadFirstRun().then((f) => alive && setFirstRun(f));
    return () => {
      alive = false;
    };
  }, []);

  if (!firstRun) return <LoadingScreen />;
  const initialRouteName = !firstRun.onboardingSeen ? 'Onboarding' : !firstRun.locationPromptSeen ? 'Permission' : 'Login';

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Onboarding" component={OnboardingRoute} />
      <Stack.Screen name="Permission" component={PermissionRoute} />
      <Stack.Screen name="Login" component={LoginRoute} />
      <Stack.Screen name="SignUp" component={SignUpRoute} />
    </Stack.Navigator>
  );
}
