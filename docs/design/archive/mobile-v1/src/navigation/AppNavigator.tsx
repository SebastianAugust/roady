import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GeofenceMonitor } from '../components/GeofenceMonitor';
import { BantuanScreen } from '../screens/BantuanScreen';
import { DetailLaporanScreen } from '../screens/DetailLaporanScreen';
import { EditProfilScreen } from '../screens/EditProfilScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LaporScreen } from '../screens/LaporScreen';
import { PengaturanScreen } from '../screens/PengaturanScreen';
import { PetaScreen } from '../screens/PetaScreen';
import { ProfilScreen } from '../screens/ProfilScreen';
import { RiwayatScreen } from '../screens/RiwayatScreen';
import type { AppScreenProps, AppStackParamList, TabParamList, TabScreenProps } from './types';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function HomeRoute({ navigation }: TabScreenProps<'Home'>) {
  return (
    <HomeScreen
      onOpenMap={() => navigation.navigate('Peta')}
      onOpenHistory={() => navigation.navigate('Riwayat')}
      onOpenReport={(report) => navigation.navigate('DetailLaporan', { report })}
      onReport={() => navigation.navigate('Lapor')}
      onProfile={() => navigation.navigate('Profil')}
    />
  );
}

function ProfilRoute({ navigation }: TabScreenProps<'Profil'>) {
  return (
    <ProfilScreen
      onHome={() => navigation.navigate('Home')}
      onReport={() => navigation.navigate('Lapor')}
      onOpenBantuan={() => navigation.navigate('Bantuan')}
      onOpenPengaturan={() => navigation.navigate('Pengaturan')}
      onEditProfil={() => navigation.navigate('EditProfil')}
    />
  );
}

// The glass bar with the center report button is drawn by the two tab screens themselves (BottomBar), so the default tab bar is hidden.
function Tabs() {
  return (
    <Tab.Navigator tabBar={() => null} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeRoute} />
      <Tab.Screen name="Profil" component={ProfilRoute} />
    </Tab.Navigator>
  );
}

const PetaRoute = ({ navigation }: AppScreenProps<'Peta'>) => <PetaScreen onBack={() => navigation.goBack()} />;
const LaporRoute = ({ navigation }: AppScreenProps<'Lapor'>) => (
  <LaporScreen onBack={() => navigation.goBack()} onDone={() => navigation.goBack()} />
);
const RiwayatRoute = ({ navigation }: AppScreenProps<'Riwayat'>) => (
  <RiwayatScreen onBack={() => navigation.goBack()} onOpenReport={(report) => navigation.navigate('DetailLaporan', { report })} />
);
const DetailRoute = ({ navigation, route }: AppScreenProps<'DetailLaporan'>) => (
  <DetailLaporanScreen report={route.params.report} onBack={() => navigation.goBack()} />
);
const BantuanRoute = ({ navigation }: AppScreenProps<'Bantuan'>) => <BantuanScreen onBack={() => navigation.goBack()} />;
const PengaturanRoute = ({ navigation }: AppScreenProps<'Pengaturan'>) => <PengaturanScreen onBack={() => navigation.goBack()} />;
const EditProfilRoute = ({ navigation }: AppScreenProps<'EditProfil'>) => <EditProfilScreen onBack={() => navigation.goBack()} />;

/** Everything behind login: the Home and Profil tabs plus the screens opened from them. Every role lands here until role-specific mobile flows exist. */
export function AppNavigator() {
  return (
    <>
      <GeofenceMonitor />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="Peta" component={PetaRoute} />
      <Stack.Screen name="Lapor" component={LaporRoute} />
      <Stack.Screen name="Riwayat" component={RiwayatRoute} />
      <Stack.Screen name="DetailLaporan" component={DetailRoute} />
      <Stack.Screen name="Bantuan" component={BantuanRoute} />
      <Stack.Screen name="Pengaturan" component={PengaturanRoute} />
      <Stack.Screen name="EditProfil" component={EditProfilRoute} />
      </Stack.Navigator>
    </>
  );
}
