import { useAuth } from '../auth/useAuth';
import { WaveIcon, type MenuIconName } from '../components/icons';
import { MenuCard } from '../components/MenuCard';
import { APP_NAME } from '../constants';
import { ROUTES } from '../routes';
import './HomePage.css';

interface Card {
  to: string;
  icon: MenuIconName;
  title: string;
  description: string;
}

// Text exactly as in docs/design/dishub/Home.png and docs/design/admin/Home.png (the app name comes from APP_NAME,
// Figma writes RoadWatchers), except the Dishub subtitle: Figma says
// "verifikasi laporan warga", but Dishub does not verify reports, so it reads "tinjau" (docs/05 #28).
const HOME = {
  dishub: {
    greeting: 'Selamat Datang, Dishub',
    subtitle: 'Kelola data kecelakaan, pantau statistik zona risiko, dan tinjau laporan warga untuk evaluasi keselamatan jalan',
    cards: [
      { to: ROUTES.statistik, icon: 'statistik', title: 'Statistik Zona', description: 'Pemetaan tingkat risiko dan sebaran zona rawan lalu lintas' },
      {
        to: ROUTES.arsip,
        icon: 'input',
        title: 'Arsip & Input',
        description: 'Tinjau kelengkapan arsip data di bawah ini, atau tambahkan rekam kecelakaan baru ke dalam sistem',
      },
      {
        to: ROUTES.laporan,
        icon: 'laporan',
        title: 'Detail Laporan',
        description: 'Pantau dan kelola rekam data kecelakaan yang terintegrasi otomatis dari sistem Dishub',
      },
      { to: ROUTES.ekspor, icon: 'ekspor', title: 'Ekspor Data', description: `Unduh data zona dan laporan ${APP_NAME} untuk kebutuhan laporan internal` },
    ] satisfies Card[],
  },
  admin: {
    greeting: 'Selamat Datang, Admin',
    subtitle: 'Pantau laporan warga dan tindak lanjuti data kecelakaan dengan cepat dan akurat',
    cards: [
      {
        to: ROUTES.verifikasi,
        icon: 'verifikasi',
        title: 'Verifikasi Laporan',
        description: 'Periksa lampiran bukti dari pelapor, lalu tentukan untuk menyetujui atau menolak laporan',
      },
      {
        to: ROUTES.kecelakaan,
        icon: 'kecelakaan',
        title: 'Kelola Data Kecelakaan',
        description: 'Pantau, perbarui, dan atur seluruh rekam data kecelakaan yang tersimpan di dalam sistem',
      },
    ] satisfies Card[],
  },
};

/** Beranda: greeting, description, the waving figure and shortcut cards for the signed-in role. No data. */
export function HomePage() {
  const { role } = useAuth();
  const home = HOME[role === 'admin' ? 'admin' : 'dishub'];
  return (
    <section className="home" aria-labelledby="home-title">
      <span className="home-wave">
        <WaveIcon />
      </span>
      <div className="home-main">
        <header className="home-head">
          <h1 id="home-title" className="home-title">
            {home.greeting}
          </h1>
          <p className="home-subtitle">{home.subtitle}</p>
        </header>
        <div className="menu-cards">
          {home.cards.map((c) => (
            <MenuCard key={c.to} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}
