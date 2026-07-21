import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';

interface BatchCell {
  id: string;
  batchNumber: string;
  expiryDate: string;
  quantityOnHand: number;
}

interface BlistarStripProps {
  batches: BatchCell[];
  showLabel?: boolean;
}

const getCellStatus = (expiryDate: string) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const days = differenceInDays(expiry, now);
  if (days <= 0) return 'expired';
  if (days <= 30) return 'danger';
  if (days <= 90) return 'warning';
  return 'good';
};

const statusStyles: Record<string, { background: string; border: string; glow: string; label: string }> = {
  good:    { background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)', border: '#0F6E5C', glow: 'rgba(15,110,92,0.3)', label: 'Good' },
  warning: { background: 'linear-gradient(135deg, #C17A1F 0%, #f59e0b 100%)', border: '#C17A1F', glow: 'rgba(193,122,31,0.3)', label: 'Expires <90d' },
  danger:  { background: 'linear-gradient(135deg, #C0392B 0%, #ef4444 100%)', border: '#C0392B', glow: 'rgba(192,57,43,0.3)', label: 'Expires <30d' },
  expired: { background: '#94A3B8', border: '#64748B', glow: 'rgba(148,163,184,0.2)', label: 'Expired' },
};

export const BlistarStrip: React.FC<BlistarStripProps> = ({ batches, showLabel = true }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const sorted = [...batches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  if (sorted.length === 0) {
    return <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>No active batches</div>;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {showLabel && (
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#64748B',
          textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10,
        }}>
          Blister Strip Batch Sequence (Soonest Expiry First)
        </div>
      )}

      {/* Connected cells strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {sorted.map((batch) => {
          const status = getCellStatus(batch.expiryDate);
          const style = statusStyles[status] || statusStyles.good;
          const isHovered = hovered === batch.id;

          return (
            <div
              key={batch.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHovered(batch.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip Card */}
              {isHovered && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginBottom: 8, zIndex: 30, pointerEvents: 'none',
                  backgroundColor: '#0D1117', color: '#fff', borderRadius: 10, padding: '10px 14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)', minWidth: 160, whiteSpace: 'nowrap',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: '#0d9488' }}>
                    {batch.batchNumber}
                  </div>
                  <div style={{ fontSize: 11, color: '#E2E8F0', marginTop: 3 }}>
                    Qty on Hand: <strong style={{ color: '#fff', fontFamily: "'Space Mono', monospace" }}>{batch.quantityOnHand}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: '#E2E8F0', marginTop: 2 }}>
                    Expiry: <strong style={{ color: '#fff' }}>{format(new Date(batch.expiryDate), 'dd MMM yyyy')}</strong>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: style.border }}>
                    ● {style.label}
                  </div>
                </div>
              )}

              {/* Blister Cell */}
              <div
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: style.background,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'pointer',
                  boxShadow: isHovered ? `0 6px 18px ${style.glow}` : '0 2px 6px rgba(0,0,0,0.1)',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>
                  {batch.quantityOnHand}
                </span>
                <span style={{ fontSize: 8, opacity: 0.8, marginTop: 2, textTransform: 'uppercase', fontWeight: 600 }}>
                  units
                </span>
              </div>
            </div>
          );
        })}

        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginLeft: 8 }}>
          {sorted.length} batch{sorted.length !== 1 ? 'es' : ''} total
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px dashed #EEF2F0' }}>
        {[
          { label: 'Good Stock', color: '#0F6E5C' },
          { label: 'Expires < 90d', color: '#C17A1F' },
          { label: 'Expires < 30d', color: '#C0392B' },
          { label: 'Expired', color: '#94A3B8' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
