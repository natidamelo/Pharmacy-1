import React, { useState, useEffect, useCallback } from 'react';
import { BarChart2, Package, Clock, TrendingUp, DollarSign, ShoppingCart, Loader2, RefreshCw } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { reportsApi } from '../api/reports';
import { format } from 'date-fns';

const tabs = [
  { id: 'sales',     label: 'Sales Report',         icon: <BarChart2 size={15} /> },
  { id: 'inventory', label: 'Inventory Valuation',  icon: <Package size={15} /> },
  { id: 'expiry',    label: 'Expiry Report',        icon: <Clock size={15} /> },
];

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; gradient: string; glow: string }> = ({ label, value, icon, gradient, glow }) => (
  <div style={{
    backgroundColor: '#fff', borderRadius: 14, padding: '18px 20px',
    border: '1px solid #EEF2F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex', alignItems: 'center', gap: 14,
    transition: 'box-shadow 0.15s',
  }}
    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 20px ${glow}`}
    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
  >
    <div style={{ width: 44, height: 44, borderRadius: 12, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: `0 4px 12px ${glow}` }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1117', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

const paymentColors: Record<string, { bg: string; color: string }> = {
  CASH:         { bg: 'rgba(15,110,92,0.1)',  color: '#0F6E5C' },
  CARD:         { bg: 'rgba(29,78,216,0.1)',  color: '#1d4ed8' },
  MOBILE_MONEY: { bg: 'rgba(124,58,237,0.1)', color: '#7c3aed' },
  INSURANCE:    { bg: 'rgba(193,122,31,0.1)', color: '#C17A1F' },
};

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'expiry'>('sales');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'sales') {
        const res = await reportsApi.salesReport({ from: fromDate || undefined, to: toDate || undefined });
        setData(res as Record<string, unknown>);
      } else if (activeTab === 'inventory') {
        const res = await reportsApi.inventoryValuation();
        setData(res as Record<string, unknown>);
      } else if (activeTab === 'expiry') {
        const res = await reportsApi.expiryReport(90);
        setData(res as Record<string, unknown>);
      }
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab, fromDate, toDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const inputStyle: React.CSSProperties = {
    border: '1.5px solid #E8EDE9', borderRadius: 10,
    padding: '8px 12px', fontSize: 13, color: '#0D1117',
    backgroundColor: '#F9FAFB', outline: 'none',
    fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
  };

  /* ── Sales tab content ── */
  const renderSales = () => {
    const summary = (data?.summary as Record<string, unknown>) || {};
    const sales = (data?.sales as Record<string, unknown>[]) || [];
    const count = (summary.count as number) || 0;
    const totalRevenue = (summary.totalRevenue as number) || 0;
    const avgSale = count > 0 ? totalRevenue / count : 0;
    const totalTax = (summary.totalTax as number) || 0;

    // Payment method breakdown
    const byPayment: Record<string, { count: number; total: number }> = {};
    for (const s of sales) {
      const pm = (s.paymentMethod as string) || 'CASH';
      if (!byPayment[pm]) byPayment[pm] = { count: 0, total: 0 };
      byPayment[pm].count++;
      byPayment[pm].total += (s.totalAmount as number) || 0;
    }
    const maxPaymentTotal = Math.max(...Object.values(byPayment).map(v => v.total), 1);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Date filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#0F6E5C'; e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#E8EDE9'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#0F6E5C'; e.target.style.boxShadow = '0 0 0 3px rgba(15,110,92,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#E8EDE9'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          {(fromDate || toDate) && (
            <button onClick={() => { setFromDate(''); setToDate(''); }} style={{ fontSize: 12, color: '#C0392B', background: 'rgba(192,57,43,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }}>
              Clear dates
            </button>
          )}
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatCard label="Total Sales" value={String(count)} icon={<ShoppingCart size={19} />} gradient="linear-gradient(135deg, #0F6E5C, #0d9488)" glow="rgba(15,110,92,0.25)" />
          <StatCard label="Total Revenue" value={`ETB ${totalRevenue.toLocaleString('en-ET', { minimumFractionDigits: 2 })}`} icon={<DollarSign size={19} />} gradient="linear-gradient(135deg, #1d4ed8, #3b82f6)" glow="rgba(29,78,216,0.2)" />
          <StatCard label="Average Sale" value={`ETB ${avgSale.toFixed(2)}`} icon={<TrendingUp size={19} />} gradient="linear-gradient(135deg, #7c3aed, #a78bfa)" glow="rgba(124,58,237,0.2)" />
          <StatCard label="Total Tax" value={`ETB ${totalTax.toFixed(2)}`} icon={<BarChart2 size={19} />} gradient="linear-gradient(135deg, #C17A1F, #f59e0b)" glow="rgba(193,122,31,0.2)" />
        </div>

        {/* Payment breakdown */}
        {Object.keys(byPayment).length > 0 && (
          <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #EEF2F0', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0D1117', margin: '0 0 16px', fontFamily: "'Space Grotesk', sans-serif" }}>Payment Method Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(byPayment).map(([pm, val]) => {
                const pct = Math.round((val.total / maxPaymentTotal) * 100);
                const colors = paymentColors[pm] || { bg: '#F1F5F9', color: '#64748B' };
                return (
                  <div key={pm}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20, backgroundColor: colors.bg, color: colors.color }}>
                        {pm.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748B', fontFamily: "'Space Mono', monospace" }}>
                        {val.count} sale{val.count !== 1 ? 's' : ''} · ETB {val.total.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ height: 6, backgroundColor: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${colors.color}, ${colors.color}88)`, borderRadius: 10, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sales table */}
        {sales.length > 0 && (
          <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #EEF2F0' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0D1117', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Sales Transactions</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAFBFA' }}>
                    {['Sale #', 'Date', 'Customer', 'Payment', 'Total'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 20).map(s => {
                    const pm = (s.paymentMethod as string) || 'CASH';
                    const colors = paymentColors[pm] || { bg: '#F1F5F9', color: '#64748B' };
                    return (
                      <tr key={s.id as string} style={{ borderBottom: '1px solid #F8FAFA' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFBFA'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                      >
                        <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: "'Space Mono', monospace", fontWeight: 600, color: '#0D1117' }}>{s.saleNumber as string}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748B' }}>{format(new Date(s.createdAt as string), 'dd MMM yyyy HH:mm')}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#4A5568' }}>{(s.customer as { name?: string })?.name ?? '—'}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, backgroundColor: colors.bg, color: colors.color }}>
                            {pm.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>ETB {(s.totalAmount as number)?.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {sales.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', backgroundColor: '#fff', borderRadius: 14, border: '1px solid #EEF2F0' }}>
            <BarChart2 size={40} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>No sales in the selected period</p>
          </div>
        )}
      </div>
    );
  };

  /* ── Inventory Valuation tab ── */
  const renderInventory = () => {
    const batches = (data?.batches as Record<string, unknown>[]) || [];
    const totalValue = (data?.totalValue as number) || 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <StatCard label="Total Inventory Value" value={`ETB ${totalValue.toLocaleString('en-ET', { minimumFractionDigits: 2 })}`} icon={<Package size={19} />} gradient="linear-gradient(135deg, #0F6E5C, #0d9488)" glow="rgba(15,110,92,0.25)" />
          <StatCard label="Active Batches" value={String(batches.length)} icon={<BarChart2 size={19} />} gradient="linear-gradient(135deg, #1d4ed8, #3b82f6)" glow="rgba(29,78,216,0.2)" />
          <StatCard label="Avg Batch Value" value={`ETB ${batches.length > 0 ? (totalValue / batches.length).toFixed(2) : '0.00'}`} icon={<TrendingUp size={19} />} gradient="linear-gradient(135deg, #7c3aed, #a78bfa)" glow="rgba(124,58,237,0.2)" />
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #EEF2F0' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0D1117', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Stock Valuation by Batch</h3>
          </div>
          {batches.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>No active batches found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAFBFA' }}>
                  {['Product', 'Batch #', 'Expiry', 'Qty', 'Cost Price', 'Total Value'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batches.map(b => {
                  const val = ((b.quantityOnHand as number) || 0) * ((b.costPrice as number) || 0);
                  return (
                    <tr key={b.id as string} style={{ borderBottom: '1px solid #F8FAFA' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFBFA'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#0D1117' }}>{(b.product as { name?: string })?.name}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: "'Space Mono', monospace", color: '#64748B' }}>{b.batchNumber as string}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748B' }}>{format(new Date(b.expiryDate as string), 'dd MMM yyyy')}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, fontFamily: "'Space Mono', monospace", color: '#0D1117' }}>{b.quantityOnHand as number}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, fontFamily: "'Space Mono', monospace", color: '#4A5568' }}>ETB {(b.costPrice as number)?.toFixed(2)}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: '#0F6E5C' }}>ETB {val.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  /* ── Expiry tab ── */
  const renderExpiry = () => {
    const expired   = (data?.expired   as Record<string, unknown>[]) || [];
    const exp30     = (data?.expiring30 as Record<string, unknown>[]) || [];
    const exp60     = (data?.expiring60 as Record<string, unknown>[]) || [];
    const exp90     = (data?.expiring90 as Record<string, unknown>[]) || [];

    const groups = [
      { label: 'Already Expired',      batches: expired, bg: 'rgba(192,57,43,0.08)',  border: 'rgba(192,57,43,0.2)',  color: '#C0392B', dot: '#C0392B' },
      { label: 'Expiring within 30d',  batches: exp30,   bg: 'rgba(193,122,31,0.08)', border: 'rgba(193,122,31,0.2)', color: '#C17A1F', dot: '#C17A1F' },
      { label: 'Expiring 30–60 days',  batches: exp60,   bg: 'rgba(29,78,216,0.05)',  border: 'rgba(29,78,216,0.2)', color: '#1d4ed8', dot: '#1d4ed8' },
      { label: 'Expiring 60–90 days',  batches: exp90,   bg: 'rgba(15,110,92,0.05)', border: 'rgba(15,110,92,0.2)', color: '#0F6E5C', dot: '#0F6E5C' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map(g => (
          <div key={g.label} style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #EEF2F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid #EEF2F0', backgroundColor: g.bg, borderLeft: `4px solid ${g.dot}` }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: g.color, margin: 0 }}>{g.label}</h3>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, backgroundColor: g.color + '22', color: g.color }}>
                {g.batches.length} batch{g.batches.length !== 1 ? 'es' : ''}
              </span>
            </div>
            {g.batches.length === 0 ? (
              <div style={{ padding: '16px 18px', fontSize: 13, color: '#94A3B8' }}>✓ None in this range</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAFBFA' }}>
                    {['Product', 'Batch #', 'Expiry Date', 'Qty on Hand'].map(h => (
                      <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #EEF2F0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.batches.map(b => (
                    <tr key={b.id as string} style={{ borderBottom: '1px solid #F8FAFA' }}>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#0D1117' }}>{(b.product as { name?: string })?.name}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: "'Space Mono', monospace", color: '#64748B' }}>{b.batchNumber as string}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: g.color, fontWeight: 600 }}>{format(new Date(b.expiryDate as string), 'dd MMM yyyy')}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, fontFamily: "'Space Mono', monospace", color: '#0D1117' }}>{b.quantityOnHand as number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100%' }}>
      <TopBar
        title="Reports"
        subtitle="Sales analytics, inventory valuation, and expiry tracking"
        actions={
          <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid #E8EDE9', background: '#fff', fontSize: 13, color: '#4A5568', cursor: 'pointer', fontWeight: 500 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      <div style={{ padding: '24px 28px' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, backgroundColor: '#fff', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid #E8EDE9', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                background: isActive ? 'linear-gradient(135deg, #0F6E5C, #0d9488)' : 'transparent',
                color: isActive ? '#fff' : '#64748B',
                boxShadow: isActive ? '0 4px 12px rgba(15,110,92,0.3)' : 'none',
                transition: 'all 0.15s', fontFamily: "'Inter', sans-serif",
              }}>
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12, backgroundColor: '#fff', borderRadius: 16, border: '1px solid #EEF2F0' }}>
            <Loader2 size={24} color="#0F6E5C" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 14, color: '#64748B' }}>Loading report data…</span>
          </div>
        ) : (
          <>
            {activeTab === 'sales'     && renderSales()}
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'expiry'    && renderExpiry()}
          </>
        )}
      </div>
    </div>
  );
};
