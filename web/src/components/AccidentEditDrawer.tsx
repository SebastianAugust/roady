import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { errorMessage } from '../hooks/useApi';
import { CUACA_LABEL } from '../lib/format';
import type { CreateAccidentRequest, Cuaca, KecelakaanResmi } from '../types';
import { Button } from './Button';
import { SelectField, type Option } from './SelectField';
import { TextField } from './TextField';
import { Drawer, useToast } from './ui';

const FORM_ID = 'accident-edit-form';
const CUACA_OPTIONS: Option<Cuaca>[] = (Object.keys(CUACA_LABEL) as Cuaca[]).map((c) => ({ value: c, label: CUACA_LABEL[c] }));

interface Props {
  /** The accident being edited; undefined keeps the drawer closed. */
  accident: KecelakaanResmi | undefined;
  onClose: () => void;
  /** Called with the saved row after API-009 answered. */
  onSaved: (accident: KecelakaanResmi) => void;
}

/** "Ubah" of Kelola Data Kecelakaan: a drawer with lokasi, cuaca and jumlah korban, Simpan and Batal. */
export function AccidentEditDrawer({ accident, onClose, onSaved }: Props) {
  return accident ? <EditContent key={accident.id_kejadian} accident={accident} onClose={onClose} onSaved={onSaved} /> : null;
}

function EditContent({ accident: a, onClose, onSaved }: Omit<Props, 'accident'> & { accident: KecelakaanResmi }) {
  const { signOut } = useAuth();
  const toast = useToast();
  const [lokasi, setLokasi] = useState(a.lokasi_deskripsi);
  const [cuaca, setCuaca] = useState<Cuaca | ''>(a.kondisi_cuaca ?? '');
  const [korban, setKorban] = useState(String(a.jumlah_korban));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const found: Record<string, string> = {};
    if (!lokasi.trim()) found.lokasi = 'Lokasi wajib diisi.';
    if (!/^\d+$/.test(korban.trim())) found.korban = 'Jumlah korban harus bilangan bulat 0 atau lebih.';
    setErrors(found);
    setFormError(undefined);
    if (Object.keys(found).length) return;

    // API-009 takes the whole record; everything not on the form is sent back as it was.
    const body: CreateAccidentRequest = {
      tanggal_waktu: a.tanggal_waktu,
      lokasi_deskripsi: lokasi.trim(),
      latitude: a.latitude,
      longitude: a.longitude,
      jumlah_korban: Number(korban),
      jenis_kendaraan_terlibat: a.jenis_kendaraan_terlibat,
      kondisi_cuaca: cuaca || null,
      jenis: a.jenis,
      foto_nama: a.foto_url ? (a.foto_url.split('/').pop()?.split('#')[0] ?? 'foto') : null,
      detail: a.detail,
    };
    setBusy(true);
    try {
      const saved = await api.updateAccident(a.id_kejadian, body);
      toast('Data kecelakaan diperbarui.');
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else if (err instanceof ApiError && err.status === 422 && err.fieldErrors) {
        const { lokasi_deskripsi, jumlah_korban, kondisi_cuaca, ...rest } = err.fieldErrors;
        setErrors({ ...(lokasi_deskripsi ? { lokasi: lokasi_deskripsi } : {}), ...(jumlah_korban ? { korban: jumlah_korban } : {}), ...(kondisi_cuaca ? { cuaca: kondisi_cuaca } : {}) });
        setFormError(Object.values(rest).join(' ') || undefined);
      } else setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer
      open
      title="Ubah data kecelakaan"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button type="submit" form={FORM_ID} busy={busy}>
            Simpan
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className="drawer-form" onSubmit={submit} noValidate>
        <TextField label="Lokasi" value={lokasi} onChange={(e) => setLokasi(e.target.value)} error={errors.lokasi} autoComplete="off" />
        <SelectField label="Cuaca" placeholder="Tidak diketahui" value={cuaca} options={CUACA_OPTIONS} onChange={setCuaca} error={errors.cuaca} />
        <TextField label="Jumlah korban" type="number" inputMode="numeric" min={0} step={1} value={korban} onChange={(e) => setKorban(e.target.value)} error={errors.korban} />
        {formError ? (
          <p className="error-text" role="alert">
            {formError}
          </p>
        ) : null}
      </form>
    </Drawer>
  );
}
