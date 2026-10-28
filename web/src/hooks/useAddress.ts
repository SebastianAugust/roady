import { useEffect, useState } from 'react';
import { reverseGeocode } from '../lib/reverseGeocode';

interface Place {
  alamat_teks?: string | null;
  latitude: number;
  longitude: number;
}

/**
 * The address to show for a report: its saved alamat_teks, otherwise the reverse-geocoded address of the coordinates
 * (Google, cached, see lib/reverseGeocode.ts). `text` is null while looking it up and when nothing was found, and the
 * caller then shows the coordinates alone.
 */
export function useAddress({ alamat_teks, latitude, longitude }: Place) {
  const saved = alamat_teks?.trim() || null;
  const [found, setFound] = useState<{ key: string; text: string | null }>();
  const key = `${latitude},${longitude}`;

  useEffect(() => {
    if (saved) return;
    const controller = new AbortController();
    reverseGeocode(latitude, longitude, controller.signal).then((text) => {
      if (!controller.signal.aborted) setFound({ key, text });
    });
    return () => controller.abort();
  }, [saved, latitude, longitude, key]);

  if (saved) return { text: saved, source: 'saved' as const };
  const text = found?.key === key ? found.text : null;
  return { text, source: text ? ('geocoded' as const) : ('none' as const) };
}
