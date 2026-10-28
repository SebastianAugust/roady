import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { WEB_ROLES } from './auth/jwt';
import { RequireRole } from './auth/RequireRole';
import { AppLayout } from './components/AppLayout';
import { ToastProvider } from './components/ToastProvider';
import { AkunPage } from './pages/AkunPage';
import { ArsipDetailPage } from './pages/ArsipDetailPage';
import { ArsipPage } from './pages/ArsipPage';
import { DashboardPage } from './pages/DashboardPage';
import { EksporPage } from './pages/EksporPage';
import { HomePage } from './pages/HomePage';
import { InputDataPage } from './pages/InputDataPage';
import { KecelakaanDetailPage } from './pages/KecelakaanDetailPage';
import { KecelakaanListPage } from './pages/KecelakaanListPage';
import { LaporanDetailPage } from './pages/LaporanDetailPage';
import { LaporanPage } from './pages/LaporanPage';
import { LoginPage } from './pages/LoginPage';
import { VerifikasiDetailPage } from './pages/VerifikasiDetailPage';
import { VerifikasiPage } from './pages/VerifikasiPage';
import { ZonaDetailPage } from './pages/ZonaDetailPage';
import { ROUTES } from './routes';

const DISHUB_ONLY = ['dishub'] as const;
const ADMIN_ONLY = ['admin'] as const;

// Admin and Dishub are two separate apps (docs/05 #30): each has its own branch behind its own guard, so typing the
// other role's URL gives the 403 page. Beranda and Akun exist for both, with content for the signed-in role.
// Pengemudi never gets past the first guard (and is turned away at Login).
export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route element={<RequireRole roles={WEB_ROLES} />}>
              <Route element={<AppLayout />}>
                <Route path={ROUTES.beranda} element={<HomePage />} />
                <Route path={ROUTES.akun} element={<AkunPage />} />

                <Route element={<RequireRole roles={DISHUB_ONLY} />}>
                  <Route path={ROUTES.statistik} element={<DashboardPage />} />
                  <Route path={`${ROUTES.statistik}/:zonaId`} element={<ZonaDetailPage />} />
                  <Route path={ROUTES.arsip} element={<ArsipPage />} />
                  <Route path={ROUTES.arsipInput} element={<InputDataPage />} />
                  <Route path={`${ROUTES.arsip}/:id`} element={<ArsipDetailPage />} />
                  <Route path={ROUTES.laporan} element={<LaporanPage />} />
                  <Route path={`${ROUTES.laporan}/:id`} element={<LaporanDetailPage />} />
                  <Route path={ROUTES.ekspor} element={<EksporPage />} />
                </Route>

                <Route element={<RequireRole roles={ADMIN_ONLY} />}>
                  <Route path={ROUTES.verifikasi} element={<VerifikasiPage />} />
                  <Route path={`${ROUTES.verifikasi}/:id`} element={<VerifikasiDetailPage />} />
                  <Route path={ROUTES.kecelakaan} element={<KecelakaanListPage />} />
                  <Route path={`${ROUTES.kecelakaan}/:id`} element={<KecelakaanDetailPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to={ROUTES.beranda} replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
