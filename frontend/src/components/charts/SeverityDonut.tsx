import React from 'react';
import { Severity } from '../../types';

interface SeverityDonutProps {
  severityCounts: Record<string, number>;
  size?: number;
}

const SEVERITY_ORDER: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#10b981',
};

/**
 * Hand-rolled SVG donut chart (no chart library).
 *
 * Trick: every segment is a full <circle> with pathLength={100}, so we can
 * think in percentages instead of arc math. strokeDasharray paints only a
 * slice of the ring, and strokeDashoffset rotates that slice to its start
 * position. A tiny gap is carved out of each slice so segments don't touch.
 */
export const SeverityDonut: React.FC<SeverityDonutProps> = ({ severityCounts, size = 190 }) => {
  const total = SEVERITY_ORDER.reduce((sum, sev) => sum + (severityCounts[sev] || 0), 0);

  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const GAP = total > 1 ? 1.2 : 0;

  let accumulatedOffset = 0;

  const segments = SEVERITY_ORDER.map((sev) => {
    const count = severityCounts[sev] || 0;
    const pct = total > 0 ? (count / total) * 100 : 0;
    const segment = {
      severity: sev,
      count,
      pct,
      dasharray: `${Math.max(pct - GAP, 0)} ${100 - Math.max(pct - GAP, 0)}`,
      dashoffset: -accumulatedOffset,
    };
    accumulatedOffset += pct;
    return segment;
  });

  return (
    <div className="donut-wrapper" data-testid="severity-donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
           aria-label={`Severity distribution donut chart of ${total} findings`}>
        <g transform={`rotate(-90 ${center} ${center})`}>
          {/* Track ring */}
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth={strokeWidth}
          />
          {/* Data segments */}
          {total > 0 && segments.map((seg) => (
            <circle
              key={seg.severity}
              cx={center} cy={center} r={radius}
              fill="none"
              stroke={SEVERITY_COLORS[seg.severity]}
              strokeWidth={strokeWidth}
              pathLength={100}
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.dashoffset}
              strokeLinecap="butt"
              className="donut-segment"
            >
              <title>{`${seg.severity}: ${seg.count} (${seg.pct.toFixed(0)}%)`}</title>
            </circle>
          ))}
        </g>
        {/* Center label */}
        <text x={center} y={center - 6} textAnchor="middle" className="donut-total">
          {total}
        </text>
        <text x={center} y={center + 16} textAnchor="middle" className="donut-total-label">
          FINDINGS
        </text>
      </svg>
    </div>
  );
};
