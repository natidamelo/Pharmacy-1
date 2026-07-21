import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { purchasingApi } from '../api/purchasing';

export const Purchasing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'po' | 'suppliers'>('po');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'po') {
          const res = await purchasingApi.listPurchaseOrders();
          setData(res || []);
        } else {
          const res = await purchasingApi.listSuppliers();
          setData(res || []);
        }
      } catch (e) {
        console.error(e);
        setData([]); // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

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

  const getPoStatusStyle = (status: string) => {
    switch (status) {
      case 'DRAFT': return { background: 'rgba(100,116,139,0.1)', color: '#64748B' };
      case 'ORDERED': return { background: 'rgba(29,78,216,0.1)', color: '#1d4ed8' };
      case 'PARTIALLY_RECEIVED': return { background: 'rgba(193,122,31,0.1)', color: '#C17A1F' };
      case 'RECEIVED': return { background: 'rgba(15,110,92,0.1)', color: '#0F6E5C' };
      case 'CANCELLED': return { background: 'rgba(192,57,43,0.1)', color: '#C0392B' };
      default: return { background: '#f1f5f9', color: '#64748B' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F5F7F6', fontFamily: "'Inter', sans-serif" }}>
      <TopBar title="Purchasing" />
      
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E8EDE9', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid #E8EDE9', backgroundColor: '#fafafa' }}>
            <button style={tabStyle(activeTab === 'po')} onClick={() => setActiveTab('po')}>Purchase Orders</button>
            <button style={tabStyle(activeTab === 'suppliers')} onClick={() => setActiveTab('suppliers')}>Suppliers</button>
          </div>

          <div style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading...</div>
            ) : (
              <>
                {activeTab === 'po' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E8EDE9', color: '#64748B', fontSize: '13px' }}>
                        <th style={{ padding: '12px', fontWeight: 500 }}>PO #</th>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Supplier</th>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Status</th>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Expected Date</th>
                        <th style={{ padding: '12px', fontWeight: 500 }}>Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length > 0 ? data.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #E8EDE9' }}>
                          <td style={{ padding: '12px', fontFamily: "'Space Mono', monospace", color: '#0D1117' }}>
                            {item.poNumber || `PO-${1000+i}`}
                          </td>
                          <td style={{ padding: '12px', color: '#0D1117', fontWeight: 500 }}>{item.supplierName || 'MediSupplies Inc.'}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              ...getPoStatusStyle(item.status || 'DRAFT'), 
                              padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 
                            }}>
                              {item.status || 'DRAFT'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#64748B' }}>{item.expectedDate || '2026-07-30'}</td>
                          <td style={{ padding: '12px', color: '#64748B', fontFamily: "'Space Mono', monospace" }}>{item.itemsCount || 5}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>No purchase orders found</td></tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === 'suppliers' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {data.length > 0 ? data.map((supplier, i) => (
                      <div key={i} style={{ padding: '20px', borderRadius: '8px', border: '1px solid #E8EDE9', backgroundColor: '#F5F7F6' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0D1117', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {supplier.name || `Supplier ${i+1}`}
                        </h3>
                        <div style={{ color: '#64748B', fontSize: '14px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 500 }}>Contact:</span> {supplier.contactPerson || 'Jane Doe'}
                        </div>
                        <div style={{ color: '#64748B', fontSize: '14px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 500 }}>Phone:</span> {supplier.phone || '+1 555-1234'}
                        </div>
                        <div style={{ color: '#64748B', fontSize: '14px' }}>
                          <span style={{ fontWeight: 500 }}>Email:</span> {supplier.email || 'contact@supplier.com'}
                        </div>
                      </div>
                    )) : (
                      <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#64748B' }}>
                        No suppliers found
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
