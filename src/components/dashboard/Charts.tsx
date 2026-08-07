import { useId } from "react";

interface LineChartProps {
  data: number[];
  data2?: number[];
  labels?: string[];
  height?: number;
}

export function LineChart({ data, data2, labels, height = 220 }: LineChartProps) {
  const gradId = useId();
  const w = 600;
  const h = height;
  const pad = 10;
  const all = data2 ? [...data, ...data2] : data;
  const max = Math.max(...all);
  const min = Math.min(...all);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);

  const toPoints = (values: number[]) =>
    values.map(
      (v, i) =>
        `${pad + i * stepX},${h - pad - ((v - min) / range) * (h - pad * 2)}`,
    );

  const series1 = toPoints(data);
  const series2 = data2 ? toPoints(data2) : null;
  const area = `${pad},${h - pad} ${series1.join(" ")} ${w - pad},${h - pad}`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="chart-line" style={{ height }} preserveAspectRatio="none" role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={w - pad}
            y1={h - pad - f * (h - pad * 2)}
            y2={h - pad - f * (h - pad * 2)}
            className="chart-grid-line"
          />
        ))}
        <polygon points={area} fill={`url(#${gradId})`} />
        <polyline points={series1.join(" ")} fill="none" className="chart-line-main" />
        {series2 ? <polyline points={series2.join(" ")} fill="none" className="chart-line-second" /> : null}
      </svg>
      {labels ? (
        <div className="chart-x-labels">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ segments, size = 168, thickness = 20 }: { segments: DonutSegment[]; size?: number; thickness?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribution donut">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </g>
    </svg>
  );
}
