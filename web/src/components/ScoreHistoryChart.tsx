import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement, Tooltip, type Plugin } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatDate } from '../lib/format';
import { RISK_LABEL } from '../lib/risk';
import { colors, fontFamily, fontSize } from '../theme/tokens';
import type { RiwayatSkorPoint } from '../types';

// Only the pieces a line chart needs, so the bundle stays small.
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

/** Dashed reference lines at the category limits of docs/01 step 5 (50 and 80), labeled in text color. */
const thresholds: Plugin<'line'> = {
  id: 'riskThresholds',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const y = scales.y;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.border;
    ctx.fillStyle = colors.textSecondary;
    ctx.font = `${fontSize.caption}px ${fontFamily.body}`;
    ctx.textAlign = 'right';
    for (const [value, label] of [
      [80, `> 80 ${RISK_LABEL.merah}`],
      [50, `50 ${RISK_LABEL.kuning}`],
    ] as const) {
      const py = y.getPixelForValue(value);
      ctx.beginPath();
      ctx.moveTo(chartArea.left, py);
      ctx.lineTo(chartArea.right, py);
      ctx.stroke();
      ctx.fillText(label, chartArea.right - 4, py - 4);
    }
    ctx.restore();
  },
};

interface Props {
  titik: RiwayatSkorPoint[];
  /** Accessible name, e.g. "Riwayat skor Zona 1". */
  label: string;
}

/**
 * One zone's score over time (KALKULASI_RISIKO rows, docs/05 #10). A single series in the accent color: the line
 * shows a zone's history, not a category, so risk colors are not used; the category of each point is in the tooltip.
 */
export function ScoreHistoryChart({ titik, label }: Props) {
  return (
    <div className="score-chart">
      <Line
        aria-label={label}
        role="img"
        plugins={[thresholds]}
        data={{
          labels: titik.map((p) => formatDate(p.last_updated)),
          datasets: [
            {
              data: titik.map((p) => p.skor_risiko),
              borderColor: colors.accent,
              backgroundColor: colors.accent,
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBorderColor: colors.surfaceRaised,
              pointBorderWidth: 2,
              tension: 0.25,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: { stepSize: 25, color: colors.textSecondary, font: { family: fontFamily.body, size: fontSize.caption } },
              grid: { color: colors.gridLine },
              border: { display: false },
              title: { display: true, text: 'Skor risiko (persentil)', color: colors.textSecondary, font: { family: fontFamily.body } },
            },
            x: {
              ticks: { color: colors.textSecondary, font: { family: fontFamily.body, size: fontSize.caption } },
              grid: { display: false },
              border: { color: colors.border },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: colors.bg,
              borderColor: colors.border,
              borderWidth: 1,
              titleColor: colors.textPrimary,
              bodyColor: colors.textSecondary,
              titleFont: { family: fontFamily.body },
              bodyFont: { family: fontFamily.body },
              displayColors: false,
              callbacks: {
                label: (item) => {
                  const p = titik[item.dataIndex];
                  return p ? `Skor ${Math.round(p.skor_risiko)} · ${RISK_LABEL[p.kategori_risiko]}` : '';
                },
              },
            },
          },
        }}
      />
    </div>
  );
}
