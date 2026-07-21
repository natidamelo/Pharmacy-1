import React, { useState, useEffect } from 'react';
import { FileText, Search } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { prescriptionsApi } from '../api/prescriptions';

export const Prescriptions: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const res = await prescriptionsApi.list({ search });
        setData(res || []);
      } catch (e) {
        console.error(e);
        setData([]); // fallback for UI
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [search]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return { background: 'rgba(193,122,31,0.12)', color: '#C17A1F' };
      case 'PARTIALLY_DISPENSED': return { background: 'rgba(29,78,216,0.1)', color: '#1d4ed8' };
      case 'FULLY_DISPENSED': return { background: 'rgba(15,110,92,0.1)', color: '#0F6E5C' };
      case 'CANCELLED': return { background: 'rgba(100,116,139,0.1)', color: '#64748B' };
      default: return { background: '#f1f5f9', color: '#64748B' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F5F7F6', fontFamily: "'Inter', sans-serif" }}>
      <TopBar title="Prescriptions" />
      
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E8EDE9', padding: '24px' }}>
          
          <div style={{ display: 'flex', marginBottom: '24px', position: 'relative' }}>
            <Search size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input 
              type="text" 
              placeholder="Search prescriptions..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                padding: '10px 12px 10px 40px', 
                border: '1px solid #E8EDE9', 
                borderRadius: '6px', 
                width: '300px',
                color: '#0D1117',
                outline: 'none',
              }} 
            />
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading...</div>
          ) : data.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#F5F7F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <FileText size={24} color="#64748B" />
              </div>
              <div style={{ color: '#0D1117', fontSize: '16px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>No prescriptions yet</div>
              <div style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Try adjusting your search or add a new one.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E8EDE9', color: '#64748B', fontSize: '13px' }}>
                  <th style={{ padding: '12px', fontWeight: 500 }}>ID</th>
                  <th style={{ padding: '12px', fontWeight: 500 }}>Prescriber</th>
                  <th style={{ padding: '12px', fontWeight: 500 }}>Customer</th>
                  <th style={{ padding: '12px', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '12px', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #E8EDE9' }}>
                    <td style={{ padding: '12px', fontFamily: "'Space Mono', monospace", color: '#64748B', fontSize: '13px' }}>
                      {item.id?.substring(0, 8) || `RX-${i.toString().padStart(4, '0')}`}
                    </td>
                    <td style={{ padding: '12px', color: '#0D1117', fontWeight: 500 }}>{item.prescriber || 'Dr. Smith'}</td>
                    <td style={{ padding: '12px', color: '#0D1117' }}>{item.customer || 'John Doe'}</td>
                    <td style={{ padding: '12px', color: '#64748B' }}>{item.date || new Date().toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        ...getStatusStyle(item.status || 'PENDING'), 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 
                      }}>
                        {item.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
