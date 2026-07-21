import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { reportsApi } from '../api/reports';

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'expiry'>('sales');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Sales filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sales') {
        const res = await reportsApi.salesReport({ from: fromDate, to: toDate });
        setData(res || { totalRevenue: 0, count: 0, avgSale: 0, breakdown: [] });
      } else if (activeTab === 'inventory') {
        const res = await reportsApi.inventoryValuation();
        setData(res || []);
      } else if (activeTab === 'expiry') {
        const res = await reportsApi.expiryReport(90);
        setData(res || []);
      }
    } catch (e) {
      console.error(e);
      // fallback for UI
      if (activeTab === 'sales') setData({ totalRevenue: 0, count: 0, avgSale: 0, breakdown: [] });
      if (activeTab === 'inventory') setData([]);
      if (activeTab === 'expiry') setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, fromDate, toDate]);

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid #0F6E5C' : '2px solid transparent',
    color: isActive ? '#0F6E5C' : '#64748B',
    fontWeight: isActive ? 600 : 400,
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    outline: 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F5F7F6', fontFamily: "'Inter', sans-serif" }}>
      <TopBar title="Reports" />
      
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E8EDE9', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid #E8EDE9', backgroundColor: '#fafafa' }}>
            <button style={tabStyle(activeTab === 'sales')} onClick={() => setActiveTab('sales')}>Sales Report</button>
            <button style={tabStyle(activeTab === 'inventory')} onClick={() => setActiveTab('inventory')}>Inventory Valuation</button>
            <button style={tabStyle(activeTab === 'expiry')} onClick={() => setActiveTab('expiry')}>Expiry Report</button>
          </div>

          <div style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading...</div>
            ) : (
              <>
                {activeTab === 'sales' && (
                  <div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                      <input 
                        type="date" 
                        value={fromDate} 
                        onChange={e => setFromDate(e.target.value)} 
                        style={{ padding: '8px 12px', border: '1px solid #E8EDE9', borderRadius: '6px', color: '#0D1117' }} 
                      />
                      <input 
                        type="date" 
                        value={toDate} 
                        onChange={e => setToDate(e.target.value)} 
                        style={{ padding: '8px 12px', border: '1px solid #E8EDE9', borderRadius: '6px', color: '#0D1117' }} 
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                      {[{ label: 'Total Revenue', value: `$${data?.totalRevenue?.toFixed(2) || '0.00'}` },
                        { label: '# Sales', value: data?.count || 0 },
                        { label: 'Avg Sale', value: `$${data?.avgSale?.toFixed(2) || '0.00'}` }
                      ].map(card => (
                        <div key={card.label} style={{ padding: '20px', backgroundColor: '#F5F7F6', borderRadius: '8px', border: '1px solid #E8EDE9' }}>
                          <div style={{ color: '#64748B', fontSize: '13px', marginBottom: '8px' }}>{card.label}</div>
                          <div style={{ color: '#0D1117', fontSize: '24px', fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{card.value}</div>
                        </div>
                      ))}
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E8EDE9', color: '#64748B', fontSize: '13px' }}>
                          <th style={{ padding: '12px', fontWeight: 500 }}>Date</th>
                          <th style={{ padding: '12px', fontWeight: 500 }}>Sales Count</th>
                          <th style={{ padding: '12px', fontWeight: 500 }}>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.breakdown?.map((row: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid #E8EDE9' }}>
                            <td style={{ padding: '12px', color: '#0D1117' }}>{row.date}</td>
                            <td style={{ padding: '12px', fontFamily: "'Space Mono', monospace" }}>{row.count}</td>
                            <td style={{ padding: '12px', fontFamily: "'Space Mono', monospace" }}>${row.revenue?.toFixed(2)}</td>
                          </tr>
                        )) || (
                          <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>No sales data available</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E8EDE9', color: '#64748B', fontSize: '13px' }}>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Product Name</th>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Stock Qty</th>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Cost Price</th>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.length > 0 ? data.map((item: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #E8EDE9' }}>
                          <td style={{ padding: '12px', color: '#0D1117', fontWeight: 500 }}>{item.productName}</td>
                          <td style={{ padding: '12px', fontFamily: "'Space Mono', monospace" }}>{item.stockQty}</td>
                          <td style={{ padding: '12px', fontFamily: "'Space Mono', monospace" }}>${item.costPrice?.toFixed(2)}</td>
                          <td style={{ padding: '12px', fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>${(item.stockQty * item.costPrice).toFixed(2)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>No inventory data available</td></tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === 'expiry' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E8EDE9', color: '#64748B', fontSize: '13px' }}>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Batch Number</th>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Product Name</th>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Expiry Date</th>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.length > 0 ? data.map((batch: any, i: number) => {
                        const daysLeft = batch.daysUntilExpiry;
                        let color = '#0284C7';
                        let bg = 'rgba(2, 132, 199, 0.1)';
                        if (daysLeft < 30) { color = '#C0392B'; bg = 'rgba(192, 57, 43, 0.1)'; }
                        else if (daysLeft <= 60) { color = '#C17A1F'; bg = 'rgba(193, 122, 31, 0.1)'; }
                        
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #E8EDE9' }}>
                            <td style={{ padding: '12px', fontFamily: "'Space Mono', monospace" }}>{batch.batchNumber}</td>
                            <td style={{ padding: '12px', color: '#0D1117' }}>{batch.productName}</td>
                            <td style={{ padding: '12px', color: '#0D1117' }}>{batch.expiryDate}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ backgroundColor: bg, color, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                {daysLeft < 30 ? '<30d' : daysLeft <= 60 ? '30-60d' : '60-90d'}
                              </span>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>No expiring batches found</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
