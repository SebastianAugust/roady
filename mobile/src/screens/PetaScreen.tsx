import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '../components/AppBackground';
import { BlurFill } from '../components/BlurFill';
import { GeofenceDebugPanel } from '../components/GeofenceDebugPanel';
import { ScreenHeader } from '../components/ScreenHeader';
import { ZoneSheet } from '../components/ZoneSheet';
import { RiskDot, ZoneMarkers } from '../components/ZoneMarkers';
import { BANDUNG_RAYA, isInBandungRaya } from '../config';
import { LocationState, useCurrentLocation } from '../hooks/useCurrentLocation';
import { useZones } from '../hooks/useZones';
import { useDebugLocation } from '../lib/debugLocation';
import { darkMapStyle } from '../lib/mapStyle';
import { RISK_LABEL } from '../lib/risk';
import { colors, fontFamily } from '../theme/tokens';
import type { KategoriRisiko } from '../types';

const LEGEND_ORDER: KategoriRisiko[] = ['merah', 'kuning', 'hijau'];

const BANDUNG_REGION: Region = { ...BANDUNG_RAYA.center, latitudeDelta: 0.28, longitudeDelta: 0.28 };

const locationLabel = (s: LocationState) =>
  s.status === 'ready' ? s.address : s.status === 'loading' ? 'Mencari lokasi…' : s.status === 'denied' ? 'Izin lokasi ditolak' : 'Tidak tersedia';

interface Props {
  onBack?: () => void;
}

export function PetaScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { location } = useCurrentLocation();
  const mapRef = useRef<MapView>(null);
  const { zones, state: zonesState, retry } = useZones();
  const { position: fakePosition } = useDebugLocation();
  const [selectedZoneId, setSelectedZoneId] = useState<number>();
  const closeSheet = useCallback(() => setSelectedZoneId(undefined), []);

  // Center on the user only when they are inside Bandung Raya; otherwise show the whole area.
  const region: Region =
    location.status === 'ready' && isInBandungRaya(location.latitude, location.longitude)
      ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.12, longitudeDelta: 0.12 }
      : BANDUNG_REGION;

  useEffect(() => {
    if (location.status === 'ready') mapRef.current?.animateToRegion(region, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- region is derived from location
  }, [location]);

  // Debug only: follow the fake position that GeofenceDebugPanel sets.
  useEffect(() => {
    if (fakePosition) mapRef.current?.animateToRegion({ ...fakePosition, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 400);
  }, [fakePosition]);

  return (
    <AppBackground>
      <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 12) + 13 }]}>
        <ScreenHeader title="Peta" onBack={onBack} />

        <Text style={styles.locationRow}>
          <Text style={styles.locationLabel}>Lokasi Anda: </Text>
          <Text style={styles.locationValue}>{locationLabel(location)}</Text>
        </Text>

        <GeofenceDebugPanel zones={zones} />

        <View style={styles.card}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            customMapStyle={darkMapStyle}
            initialRegion={region}
            showsUserLocation={location.status === 'ready'}
            toolbarEnabled={false}
            onPress={closeSheet}
          >
            <ZoneMarkers zones={zones} onSelect={(z) => setSelectedZoneId(z.zona_id)} />
            {__DEV__ && fakePosition ? <Marker coordinate={fakePosition} title="Posisi palsu (debug)" pinColor="blue" /> : null}
          </MapView>

          <View style={styles.legend} accessibilityLabel="Legenda: merah risiko tinggi, kuning risiko sedang, hijau risiko rendah">
            <BlurFill radius={5} />
            {LEGEND_ORDER.map((k) => (
              <View key={k} style={styles.legendRow}>
                <RiskDot kategori={k} />
                <Text style={styles.legendText}>{RISK_LABEL[k]}</Text>
              </View>
            ))}
          </View>

          {zonesState === 'loading' ? (
            <View style={styles.status} accessibilityLiveRegion="polite">
              <ActivityIndicator color={colors.textPrimary} />
              <Text style={styles.statusText}>Memuat zona risiko…</Text>
            </View>
          ) : null}
          {zonesState === 'error' ? (
            <View style={styles.status} accessibilityLiveRegion="polite">
              <Text style={styles.statusText}>Zona risiko gagal dimuat. Periksa koneksi lalu coba lagi.</Text>
              <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}>
                <Text style={styles.retryText}>Coba lagi</Text>
              </Pressable>
            </View>
          ) : null}
          {zonesState === 'ready' && zones.length === 0 ? (
            <View style={styles.status}>
              <Text style={styles.statusText}>Belum ada zona risiko di area ini.</Text>
            </View>
          ) : null}

          <ZoneSheet zonaId={selectedZoneId} onClose={closeSheet} />
        </View>
      </View>
    </AppBackground>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  locationRow: { textAlign: 'left', marginTop: 4, marginBottom: 13, paddingLeft: 8 },
  locationLabel: { fontFamily: fontFamily.semibold, fontSize: 16, color: colors.textSecondary },
  locationValue: { fontFamily: fontFamily.extrabold, fontSize: 16, color: colors.textPrimary },
  card: { flex: 1, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.surface },
  legend: {
    position: 'absolute',
    left: 21,
    top: 24,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 5,
    borderRadius: 5,
    backgroundColor: colors.legendFill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendText: { fontFamily: fontFamily.semibold, fontSize: 12, color: colors.textPrimary },
  status: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    padding: 12,
    gap: 8,
    alignItems: 'center',
    borderRadius: 9,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: { fontFamily: fontFamily.semibold, fontSize: 14, color: colors.textPrimary, textAlign: 'center' },
  retry: { minHeight: 44, paddingHorizontal: 20, borderRadius: 13, backgroundColor: colors.buttonPrimary, justifyContent: 'center' },
  retryText: { fontFamily: fontFamily.extrabold, fontSize: 14, color: colors.onButtonPrimary },
});
