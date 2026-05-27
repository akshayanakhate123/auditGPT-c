"use client";

import { scoreColor } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number | null;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
}

const sizeMap = {
  sm: { viewBox: 60, r: 22, stroke: 4, fontSize: 14, labelSize: 10 },
  md: { viewBox: 80, r: 30, stroke: 5, fontSize: 18, labelSize: 11 },
  lg: { viewBox: 120, r: 46, stroke: 7, fontSize: 26, labelSize: 12 },
  xl: { viewBox: 180, r: 70, stroke: 10, fontSize: 38, labelSize: 14 },
};

const GRAY = "rgb(156 163 175)";

export function ScoreGauge({ score, size = "md", showLabel = false }: ScoreGaugeProps) {
  const { viewBox, r, stroke, fontSize, labelSize } = sizeMap[size];
  const cx = viewBox / 2;
  const cy = viewBox / 2;
  const circumference = 2 * Math.PI * r;

  if (score === null) {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width={viewBox} height={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`} aria-label="No data">
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(229 231 235)" strokeWidth={stroke} />
          </g>
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontWeight="700" fill={GRAY} style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
            —
          </text>
        </svg>
        {showLabel && (
          <span className="text-xs font-semibold" style={{ color: GRAY, fontSize: labelSize }}>
            No data
          </span>
        )}
      </div>
    );
  }

  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = scoreColor(score);
  const label = score < 40 ? "Critical" : score < 70 ? "Average" : "Strong";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={viewBox}
        height={viewBox}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        aria-label={`Score: ${score}`}
      >
        {/* Rotate only the arcs, not the text */}
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgb(229 231 235)"
            strokeWidth={stroke}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </g>
        {/* Text is outside the rotated group so it stays upright */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight="700"
          fill={color}
          style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
        >
          {score}
        </text>
      </svg>
      {showLabel && (
        <span className="text-xs font-semibold" style={{ color, fontSize: labelSize }}>
          {label}
        </span>
      )}
    </div>
  );
}
