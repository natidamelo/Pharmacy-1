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

const cellColors = {
  good: 'bg-primary-500 border-primary-dark',
  warning: 'bg-warning-500 border-warning-500',
  danger: 'bg-danger-500 border-danger-light',
  expired: 'bg-ink-subtle border-ink-muted opacity-40',
};

const Tooltip: React.FC<{ batch: BatchCell; status: string }> = ({ batch, status }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
    <div className="bg-ink text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
      <div className="font-mono font-bold">{batch.batchNumber}</div>
      <div>Qty: <span className="font-mono">{batch.quantityOnHand}</span></div>
      <div>Exp: <span className="font-mono">{format(new Date(batch.expiryDate), 'dd MMM yyyy')}</span></div>
      <div className={`capitalize ${
        status === 'expired' ? 'text-danger-light' :
        status === 'danger' ? 'text-warning-500' :
        status === 'warning' ? 'text-yellow-300' : 'text-primary-100'
      }`}>{status === 'expired' ? 'Expired' : status === 'danger' ? 'Expires <30d' : status === 'warning' ? 'Expires <90d' : 'Good'}</div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />
    </div>
  </div>
);

export const BlistarStrip: React.FC<BlistarStripProps> = ({ batches, showLabel = true }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const sorted = [...batches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  if (sorted.length === 0) {
    return <div className="text-xs text-ink-subtle italic">No active batches</div>;
  }

  return (
    <div>
      {showLabel && <div className="text-2xs font-semibold text-ink-subtle uppercase tracking-wider mb-1.5">Batch status</div>}
      <div className="flex items-center gap-px">
        {sorted.map((batch, idx) => {
          const status = getCellStatus(batch.expiryDate);
          return (
            <div
              key={batch.id}
              className="relative"
              onMouseEnter={() => setHovered(batch.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {hovered === batch.id && <Tooltip batch={batch} status={status} />}
              <div
                className={`
                  w-6 h-6 border cursor-pointer transition-all duration-150
                  hover:scale-110 hover:z-10 relative
                  ${cellColors[status as keyof typeof cellColors]}
                  ${idx === 0 ? 'rounded-l-cell' : ''}
                  ${idx === sorted.length - 1 ? 'rounded-r-cell' : ''}
                `}
                role="img"
                aria-label={`Batch ${batch.batchNumber}: ${batch.quantityOnHand} units, expires ${format(new Date(batch.expiryDate), 'dd MMM yyyy')}`}
              />
            </div>
          );
        })}
        <div className="ml-2 text-xs text-ink-subtle">{sorted.length} batch{sorted.length !== 1 ? 'es' : ''}</div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-2">
        {[['good','bg-primary-500','Good'],['warning','bg-warning-500','<90d'],['danger','bg-danger-500','<30d'],['expired','bg-ink-subtle opacity-40','Expired']].map(([,color,label]) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-2xs text-ink-subtle">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
