import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { AccidentForm } from '../components/AccidentForm';
import { BackButton } from '../components/BackButton';
import { SentCheckIcon } from '../components/icons';
import { SuccessScreen } from '../components/SuccessScreen';
import { EMPTY_ACCIDENT_FORM } from '../lib/accidentForm';
import { formatDateTime } from '../lib/format';
import { ROUTES } from '../routes';
import type { KecelakaanResmi } from '../types';
import './InputDataPage.css';

/**
 * The form variant of "dishub - input data resmi" (docs/design/dishub/dishub - input data resmi-1.png), opened from
 * INPUT DATA on Arsip & Input: back button, the form, then the confirmation frame; SELESAI returns to the archive.
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
        detail={`Kejadian ${formatDateTime(saved.tanggal_waktu)} tercatat di Zona ${saved.zona_id}.`}
        onDone={() => navigate(ROUTES.arsip)}
      />
    );
  }

  return (
    <div className="input-page">
      <BackButton fallback={ROUTES.arsip} />
      <div className="input-page-body">
        {/* The Figma frame has no visible title; the heading is for screen readers. */}
        <h1 className="visually-hidden">Input Data Resmi</h1>
        <AccidentForm initial={EMPTY_ACCIDENT_FORM} submitLabel="INPUT DATA" onSubmit={async (body) => setSaved(await api.createAccident(body))} />
      </div>
    </div>
  );
}
