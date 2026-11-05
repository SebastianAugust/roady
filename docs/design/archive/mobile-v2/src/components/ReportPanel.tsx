import { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Glass } from './Glass';

/** Glass panel that holds the report cards on Home and Riwayat Laporan (prototype .rp: radius 26). The cards inside are inner glass (no blur). */
export function ReportPanel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Glass radius={26} style={[styles.panel, style]}>
      {children}
    </Glass>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 12, gap: 10 },
});
