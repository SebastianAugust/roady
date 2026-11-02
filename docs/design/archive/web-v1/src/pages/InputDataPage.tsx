import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { BackButton } from '../components/BackButton';
import { SentCheckIcon } from '../components/icons';
import { ReportTemplateForm } from '../components/ReportTemplateForm';
import { SuccessScreen } from '../components/SuccessScreen';
import { formatDateTime } from '../lib/format';
import { JENIS_LABEL } from '../lib/reportTemplates';
import { ROUTES } from '../routes';
import type { KecelakaanResmi } from '../types';
import './InputDataPage.css';

/**
 * The form variant of "dishub - input data resmi" (docs/design/dishub/dishub - input data resmi-1.png), opened from
 * INPUT DATA on Arsip & Input: back button, the template form (pick Kecelakaan, Nyaris celaka or Masalah jalan, then
 * the structured fields of that kind), then the confirmation frame; SELESAI returns to the archive.
 * API-010; the body has no input_by, the server takes the officer from the JWT.
 */
export function InputDataPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<KecelakaanResmi>();

  if (saved) {
    return (
      <SuccessScreen
        icon={<SentCheckIcon />}
        message="Terima kasih, input data sudah kami terima!"
        detail={`${JENIS_LABEL[saved.jenis]} ${formatDateTime(saved.tanggal_waktu)} tercatat di Zona ${saved.zona_id}, diinput oleh ${saved.input_by_kode} · ${saved.input_by_nama}.`}
        onDone={() => navigate(ROUTES.arsip)}
      />
    );
  }

  return (
    <div className="input-page">
      <BackButton fallback={ROUTES.arsip} />
      <div className="input-page-body">
        <h1 className="visually-hidden">Input Data Resmi</h1>
        <ReportTemplateForm onSubmit={async (body) => setSaved(await api.createAccident(body))} />
      </div>
    </div>
  );
}
