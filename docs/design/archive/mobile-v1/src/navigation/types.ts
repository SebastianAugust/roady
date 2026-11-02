import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Laporan } from '../types';

export type AuthStackParamList = {
  Onboarding: undefined;
  Permission: undefined;
  Login: undefined;
  SignUp: undefined;
};

export type TabParamList = {
  Home: undefined;
  Profil: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  Peta: undefined;
  Lapor: undefined;
  Riwayat: undefined;
  DetailLaporan: { report: Laporan };
  Bantuan: undefined;
  Pengaturan: undefined;
  EditProfil: undefined;
};

export type AuthScreenProps<R extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, R>;
export type AppScreenProps<R extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, R>;
export type TabScreenProps<R extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, R>,
  NativeStackScreenProps<AppStackParamList>
>;
