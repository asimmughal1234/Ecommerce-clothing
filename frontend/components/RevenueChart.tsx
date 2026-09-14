"use client";

import { useId, useState } from "react";
import { formatPrice } from "@/lib/format";

interface Point {
  date: string;
  total: number;
}

export default function RevenueChart({ data }: { data: Point[] }) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="text-sm text-ink/50">No paid orders yet.</p>;
  }

  const width = 800;
  const height = 220;
  const padding = { top: 16, right: 12, bottom: 28, left: 12 };
  const max = Math.max(...data.map((d) => d.total), 1);
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (d.total / max) * innerH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  const active = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-56"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4C5738" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4C5738" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1={padding.left} y1={padding.top + innerH} x2={width - padding.right} y2={padding.top + innerH} stroke="#D3CBB9" strokeWidth={1} />

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke="#4C5738" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <g key={p.date}>
            <rect
              x={padding.left + i * stepX - stepX / 2}
              y={0}
              width={stepX || innerW}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
            {(hoverIndex === i || data.length === 1) && (
              <>
                <line x1={p.x} y1={padding.top} x2={p.x} y2={padding.top + innerH} stroke="#4C5738" strokeWidth={1} strokeDasharray="3 3" />
                <circle cx={p.x} cy={p.y} r={4} fill="#4C5738" stroke="#F8F5EE" strokeWidth={2} />
              </>
            )}
          </g>
        ))}

        {points.map((p, i) => {
          if (points.length > 8 && i % 2 !== 0 && i !== points.length - 1) return null;
          return (
            <text key={`label-${p.date}`} x={p.x} y={height - 6} fontSize={10} fill="#8A857A" textAnchor="middle">
              {p.date.slice(5)}
            </text>
          );
        })}
      </svg>

      <div className="absolute top-0 left-0 text-sm">
        {active ? (
          <>
            <p className="font-display text-xl tracking-tightest">{formatPrice(active.total)}</p>
            <p className="text-xs text-ink/50">{new Date(active.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
          </>
        ) : (
          <>
            <p className="font-display text-xl tracking-tightest">{formatPrice(data.reduce((sum, d) => sum + d.total, 0))}</p>
            <p className="text-xs text-ink/50">Total, days shown</p>
          </>
        )}
      </div>
    </div>
  );
}
