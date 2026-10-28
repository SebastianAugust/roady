import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GEOFENCE_COOLDOWN_MIN, GEOFENCE_RADIUS_M } from '../geofence';
import { resetGeofenceMemory, setDebugPosition, useDebugLocation } from '../lib/debugLocation';
import { colors, fontFamily } from '../theme/tokens';
import type { KategoriRisiko, Zona } from '../types';

const NEAR_M = GEOFENCE_RADIUS_M - 50;
const FAR_M = GEOFENCE_RADIUS_M * 5;
const M_PER_DEG_LAT = (Math.PI / 180) * 6371000;

const northOf = (zone: Zona, meters: number) => ({
  latitude: zone.center_latitude + meters / M_PER_DEG_LAT,
  longitude: zone.center_longitude,
});

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.action}>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

/** Development only: moves the fake user next to a sample zone so the early warning can be tested without driving. */
export function GeofenceDebugPanel({ zones }: { zones: readonly Zona[] }) {
  const { position } = useDebugLocation();
  if (!__DEV__) return null;

  const top = (kategori: KategoriRisiko) => zones.filter((z) => z.kategori_risiko === kategori).sort((a, b) => b.skor_risiko - a.skor_risiko)[0];
  const merah = top('merah');
  const kuning = top('kuning');
  const anchor = merah ?? kuning ?? zones[0];

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>
        Debug peringatan dini · {position ? 'posisi palsu' : 'GPS asli'} · radius {GEOFENCE_RADIUS_M} m, jeda {GEOFENCE_COOLDOWN_MIN} mnt
      </Text>
      <View style={styles.row}>
        {merah ? <Action label={`Dekati merah (${NEAR_M} m)`} onPress={() => setDebugPosition(northOf(merah, NEAR_M))} /> : null}
        {kuning ? <Action label={`Dekati kuning (${NEAR_M} m)`} onPress={() => setDebugPosition(northOf(kuning, NEAR_M))} /> : null}
        {anchor ? <Action label={`Jauhi (${FAR_M} m)`} onPress={() => setDebugPosition(northOf(anchor, FAR_M))} /> : null}
        <Action label="Reset jeda" onPress={resetGeofenceMemory} />
        <Action label="GPS asli" onPress={() => setDebugPosition(undefined)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginTop: 8, padding: 8, gap: 6, borderRadius: 9, backgroundColor: colors.glass },
  title: { fontFamily: fontFamily.semibold, fontSize: 11, color: colors.white },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  action: { minHeight: 44, paddingHorizontal: 10, borderRadius: 9, backgroundColor: colors.surfaceRaised, justifyContent: 'center' },
  actionText: { fontFamily: fontFamily.extrabold, fontSize: 12, color: colors.white },
});
