import type { ReactNode } from "react";
import { TrendingDownIcon, TrendingUpIcon } from "../icons";

type Tone = "brand" | "success" | "warning" | "danger" | "info";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: Tone;
  delta?: number;
  sub?: string;
}

export default function StatCard({ label, value, icon, tone = "brand", delta, sub }: StatCardProps) {
  const up = (delta ?? 0) >= 0;

  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-ico ${tone}`}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        {delta !== undefined ? (
          <span className={`stat-delta ${up ? "up" : "down"}`}>
            {up ? <TrendingUpIcon size={12} /> : <TrendingDownIcon size={12} />}
            {Math.abs(delta)}%
          </span>
        ) : null}
        {sub ? <span className="stat-sub">{sub}</span> : null}
      </div>
    </article>
  );
}
