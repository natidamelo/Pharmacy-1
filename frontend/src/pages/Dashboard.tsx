import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, AlertTriangle, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { PageLoader } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { salesApi } from '../api/sales';
import { alertsApi } from '../api/alerts';
import { format } from 'date-fns';

type Sale = Record<string, unknown>;
type Alert = Record<string, unknown>;

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'warning' | 'danger' | 'neutral';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, color }) => {
  const colorMap = {
    primary: 'bg-teal-50 text-teal-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    neutral: 'bg-gray-50 text-gray-700',
  };
  return (
    <div className={`card p-5 flex items-center gap-4 ${colorMap[color].split(' ')[0]}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/70 ${colorMap[color].split(' ')[1]}`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-display font-bold tabular ${colorMap[color].split(' ')[1]}`}>{value}</div>
        <div className="text-sm text-ink-muted">{title}</div>
        {subtitle && <div className="text-xs text-ink-subtle mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [lowStock, setLowStock] = useState<Alert[]>([]);
  const [expiring, setExpiring] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <><TopBar title="Dashboard" /><PageLoader /></>;

  return (
    <div>
      <TopBar title="Dashboard" subtitle={`Today, ${format(new Date(), 'EEEE d MMMM yyyy')}`} />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Today's Sales" value={sales.length} icon={<ShoppingCart size={20} />} color="neutral" />
          <KPICard title="Today's Revenue" value={`ETB ${todayRevenue.toFixed(2)}`} icon={<TrendingUp size={20} />} color="primary" />
          <KPICard title="Low Stock Items" value={lowStock.length} subtitle={lowStock.length > 0 ? 'Needs reorder' : 'All good'} icon={<Package size={20} />} color={lowStock.length > 0 ? 'warning' : 'neutral'} />
          <KPICard title="Expiring <30d" value={expiring.length} subtitle={expiring.length > 0 ? 'Review soon' : 'All good'} icon={<Clock size={20} />} color={expiring.length > 0 ? 'danger' : 'neutral'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold font-display text-ink">Recent Sales</h2>
              <Link to="/pos" className="text-xs text-primary hover:underline flex items-center gap-1">
                New sale <ArrowRight size={12} />
              </Link>
            </div>
            {sales.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart size={32} className="text-border mx-auto mb-3" style={{ color: '#cbd5e1' }} />
                <p className="text-sm text-ink-muted">No sales today yet</p>
                <Link to="/pos" className="text-sm text-primary hover:underline mt-1 inline-block">Make your first sale →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Sale #</th><th>Time</th><th>Total</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {sales.slice(0, 8).map((sale) => (
                      <tr key={sale.id as string}>
                        <td className="font-mono text-xs text-ink">{sale.saleNumber as string}</td>
                        <td className="text-ink-muted">{format(new Date(sale.createdAt as string), 'HH:mm')}</td>
                        <td className="tabular font-medium">ETB {(sale.totalAmount as number)?.toFixed(2)}</td>
                        <td>
                          <Badge variant={sale.status === 'COMPLETED' ? 'success' : sale.status === 'REFUNDED' ? 'warning' : 'danger'}>
                            {sale.status as string}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center gap-2 p-4 border-b border-border">
                <AlertTriangle size={14} className="text-amber-500" />
                <h2 className="font-semibold font-display text-sm text-ink">Low Stock</h2>
              </div>
              {lowStock.length === 0 ? (
                <p className="p-4 text-xs text-ink-subtle">All products are well stocked.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {lowStock.slice(0, 5).map((item) => (
                    <li key={item.productId as string} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-ink truncate max-w-[130px]">{item.productName as string}</div>
                        <div className="text-xs text-ink-subtle">Reorder at {item.reorderLevel as number}</div>
                      </div>
                      <Badge variant="warning">{item.stockOnHand as number} left</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <div className="flex items-center gap-2 p-4 border-b border-border">
                <Clock size={14} className="text-red-500" />
                <h2 className="font-semibold font-display text-sm text-ink">Expiring Soon</h2>
              </div>
              {expiring.length === 0 ? (
                <p className="p-4 text-xs text-ink-subtle">No batches expiring within 30 days.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {expiring.slice(0, 5).map((item) => (
                    <li key={item.batchId as string} className="px-4 py-3">
                      <div className="text-sm font-medium text-ink truncate">{item.productName as string}</div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-mono text-ink-subtle">{item.batchNumber as string}</span>
                        <Badge variant="danger">{item.daysToExpiry as number}d</Badge>
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
