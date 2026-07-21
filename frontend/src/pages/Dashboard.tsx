import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, AlertTriangle, Clock, TrendingUp, ArrowRight, Plus, Zap } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { PageLoader } from '../components/ui/Spinner';
import { salesApi } from '../api/sales';
import { alertsApi } from '../api/alerts';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';

type Sale = Record<string, unknown>;
type Alert = Record<string, unknown>;

const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  trend?: string;
}> = ({ title, value, subtitle, icon, gradient, glow, trend }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: 16,
    border: '1px solid #EEF2F0',
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${glow}`;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
    }}
  >
    {/* Background accent */}
    <div style={{
      position: 'absolute', top: -20, right: -20,
      width: 100, height: 100, borderRadius: '50%',
      background: gradient, opacity: 0.07, pointerEvents: 'none',
    }} />

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', boxShadow: `0 4px 12px ${glow}`,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      {trend && (
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#0F6E5C',
          background: 'rgba(15,110,92,0.1)', borderRadius: 20, padding: '2px 8px'
        }}>
          {trend}
        </span>
      )}
    </div>

    <div>
      <div style={{
        fontSize: 26, fontWeight: 700, color: '#0D1117',
        fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1, letterSpacing: '-0.5px',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#4A5568', marginTop: 4, fontWeight: 500 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{subtitle}</div>}
    </div>
  </div>
);

const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    COMPLETED: { bg: 'rgba(15,110,92,0.1)', color: '#0F6E5C', label: 'Completed' },
    REFUNDED:  { bg: 'rgba(193,122,31,0.1)', color: '#C17A1F', label: 'Refunded' },
    VOID:      { bg: 'rgba(192,57,43,0.1)', color: '#C0392B', label: 'Void' },
  };
  const s = map[status] ?? { bg: '#f1f5f9', color: '#64748b', label: status };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
      backgroundColor: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
};

export const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [lowStock, setLowStock] = useState<Alert[]>([]);
  const [expiring, setExpiring] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    Promise.all([
      salesApi.list({ from: today.toISOString(), pageSize: '10' }),
      alertsApi.lowStock(),
      alertsApi.expiring(30),
    ]).then(([salesData, lowStockData, expiringData]) => {
      setSales(salesData.data || []);
      setLowStock(Array.isArray(lowStockData) ? lowStockData : lowStockData?.data || []);
      setExpiring(Array.isArray(expiringData) ? expiringData : expiringData?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const todayRevenue = sales
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + ((s.totalAmount as number) || 0), 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const actions = (
    <Link
      to="/pos"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
        color: '#fff', fontSize: 13, fontWeight: 600,
        padding: '8px 16px', borderRadius: 10, textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
        transition: 'all 0.15s',
      }}
    >
      <Plus size={14} />
      New Sale
    </Link>
  );

  if (loading) return <><TopBar title="Dashboard" /><PageLoader /></>;

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100%' }}>
      <TopBar
        title={`${greeting()}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
        subtitle={format(new Date(), 'EEEE, d MMMM yyyy')}
        actions={actions}
      />

      <div style={{ padding: '28px 28px 40px' }}>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <KPICard
            title="Today's Sales"
            value={sales.length}
            subtitle={sales.length === 0 ? 'No transactions yet' : `${sales.filter(s => s.status === 'COMPLETED').length} completed`}
            icon={<ShoppingCart size={19} />}
            gradient="linear-gradient(135deg, #0F6E5C, #0d9488)"
            glow="rgba(15,110,92,0.25)"
          />
          <KPICard
            title="Today's Revenue"
            value={`ETB ${todayRevenue.toLocaleString('en-ET', { minimumFractionDigits: 2 })}`}
            subtitle={sales.length > 0 ? `Avg ETB ${(todayRevenue / Math.max(sales.length, 1)).toFixed(0)} / sale` : 'No revenue yet'}
            icon={<TrendingUp size={19} />}
            gradient="linear-gradient(135deg, #1d4ed8, #3b82f6)"
            glow="rgba(29,78,216,0.2)"
          />
          <KPICard
            title="Low Stock Items"
            value={lowStock.length}
            subtitle={lowStock.length > 0 ? 'Needs reorder' : '✓ All stocked'}
            icon={<Package size={19} />}
            gradient={lowStock.length > 0 ? 'linear-gradient(135deg, #C17A1F, #f59e0b)' : 'linear-gradient(135deg, #6b7280, #9ca3af)'}
            glow={lowStock.length > 0 ? 'rgba(193,122,31,0.25)' : 'rgba(107,114,128,0.15)'}
          />
          <KPICard
            title="Expiring < 30 Days"
            value={expiring.length}
            subtitle={expiring.length > 0 ? 'Review soon' : '✓ All good'}
            icon={<Clock size={19} />}
            gradient={expiring.length > 0 ? 'linear-gradient(135deg, #C0392B, #ef4444)' : 'linear-gradient(135deg, #6b7280, #9ca3af)'}
            glow={expiring.length > 0 ? 'rgba(192,57,43,0.25)' : 'rgba(107,114,128,0.15)'}
          />
        </div>

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

          {/* Recent Sales Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #EEF2F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px', borderBottom: '1px solid #EEF2F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShoppingCart size={15} color="#fff" />
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0D1117', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Today's Sales
                </h2>
              </div>
              <Link
                to="/pos"
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 12, fontWeight: 600, color: '#0F6E5C',
                  textDecoration: 'none', padding: '5px 12px', borderRadius: 8,
                  border: '1px solid rgba(15,110,92,0.3)',
                  background: 'rgba(15,110,92,0.06)',
                  transition: 'all 0.15s',
                }}
              >
                New sale <ArrowRight size={11} />
              </Link>
            </div>

            {sales.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <ShoppingCart size={24} color="#0F6E5C" />
                </div>
                <p style={{ fontSize: 14, color: '#4A5568', fontWeight: 500, margin: '0 0 6px' }}>
                  No sales today yet
                </p>
                <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
                  Start processing sales from the POS screen
                </p>
                <Link
                  to="/pos"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'linear-gradient(135deg, #0F6E5C, #0d9488)',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    padding: '9px 18px', borderRadius: 10, textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(15,110,92,0.3)',
                  }}
                >
                  <Zap size={13} />
                  Make first sale
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FAFBFA' }}>
                      {['Sale #', 'Time', 'Customer', 'Amount', 'Status'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontSize: 11, fontWeight: 600, color: '#64748B',
                          textTransform: 'uppercase', letterSpacing: '0.6px',
                          borderBottom: '1px solid #EEF2F0',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sales.slice(0, 8).map((sale) => (
                      <tr
                        key={sale.id as string}
                        style={{ borderBottom: '1px solid #F8FAFA', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#FAFBFA'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: '#0D1117', fontWeight: 600 }}>
                            {sale.saleNumber as string}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>
                          {format(new Date(sale.createdAt as string), 'HH:mm')}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#4A5568' }}>
                          {(sale.customer as { name?: string })?.name ?? '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0D1117', fontFamily: "'Space Mono', monospace" }}>
                          ETB {(sale.totalAmount as number)?.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {statusBadge(sale.status as string)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Alert panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Low Stock */}
            <div style={{
              background: '#ffffff', borderRadius: 16,
              border: '1px solid #EEF2F0', overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 18px', borderBottom: '1px solid #EEF2F0',
                background: lowStock.length > 0 ? 'rgba(251,191,36,0.05)' : '#fff',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: lowStock.length > 0 ? 'rgba(193,122,31,0.15)' : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={14} color={lowStock.length > 0 ? '#C17A1F' : '#94A3B8'} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0D1117', margin: 0 }}>Low Stock</h2>
                  <p style={{ fontSize: 10, color: '#94A3B8', margin: 0 }}>
                    {lowStock.length > 0 ? `${lowStock.length} item${lowStock.length !== 1 ? 's' : ''} need reorder` : 'All products stocked'}
                  </p>
                </div>
              </div>

              {lowStock.length === 0 ? (
                <div style={{ padding: '20px 18px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#94A3B8' }}>🎉 All products are well stocked</p>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {lowStock.slice(0, 5).map((item, idx) => (
                    <li key={item.productId as string} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 18px',
                      borderBottom: idx < Math.min(lowStock.length, 5) - 1 ? '1px solid #F8FAFA' : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1117', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.productName as string}
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>
                          Reorder at {item.reorderLevel as number}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                        backgroundColor: 'rgba(193,122,31,0.12)', color: '#C17A1F',
                      }}>
                        {item.stockOnHand as number} left
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Expiring Soon */}
            <div style={{
              background: '#ffffff', borderRadius: 16,
              border: '1px solid #EEF2F0', overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 18px', borderBottom: '1px solid #EEF2F0',
                background: expiring.length > 0 ? 'rgba(192,57,43,0.04)' : '#fff',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: expiring.length > 0 ? 'rgba(192,57,43,0.12)' : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Clock size={14} color={expiring.length > 0 ? '#C0392B' : '#94A3B8'} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0D1117', margin: 0 }}>Expiring Soon</h2>
                  <p style={{ fontSize: 10, color: '#94A3B8', margin: 0 }}>
                    {expiring.length > 0 ? `${expiring.length} batch${expiring.length !== 1 ? 'es' : ''} within 30 days` : 'No batches expiring soon'}
                  </p>
                </div>
              </div>

              {expiring.length === 0 ? (
                <div style={{ padding: '20px 18px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#94A3B8' }}>✓ No batches expiring within 30 days</p>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {expiring.slice(0, 5).map((item, idx) => (
                    <li key={item.batchId as string} style={{
                      padding: '11px 18px',
                      borderBottom: idx < Math.min(expiring.length, 5) - 1 ? '1px solid #F8FAFA' : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1117', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                          {item.productName as string}
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, flexShrink: 0,
                          backgroundColor: (item.daysToExpiry as number) <= 7 ? 'rgba(192,57,43,0.12)' : 'rgba(193,122,31,0.12)',
                          color: (item.daysToExpiry as number) <= 7 ? '#C0392B' : '#C17A1F',
                        }}>
                          {item.daysToExpiry as number}d
                        </span>
                      </div>
                      <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#94A3B8', marginTop: 2 }}>
                        {item.batchNumber as string}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
