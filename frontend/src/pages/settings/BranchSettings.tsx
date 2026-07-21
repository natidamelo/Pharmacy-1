import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { settingsApi } from '../../api/users';
import toast from 'react-hot-toast';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #E8EDE9', borderRadius: 10,
  fontSize: 14, color: '#0D1117', backgroundColor: '#F9FAFB',
  padding: '10px 14px', outline: 'none', transition: 'all 0.15s',
  fontFamily: "'Inter', sans-serif",
};

export const BranchSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get().then(s => { setSettings(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.update(settings);
      toast.success('Settings saved successfully');
    } catch { toast.error('Failed to save settings'); } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, margin: 0 }}>Loading branch settings…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 520 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0D1117', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Branch & Currency Configuration</h2>
        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>Configure global pharmacy parameters</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="branch-name" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Branch Name</label>
          <input id="branch-name" value={settings.branchName || ''} onChange={e => setSettings(s => ({ ...s, branchName: e.target.value }))} style={inputStyle} />
        </div>

        <div>
          <label htmlFor="currency" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Default Currency</label>
          <input id="currency" value={settings.currency || 'ETB'} onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))} style={inputStyle} />
        </div>

        <div>
          <label htmlFor="tax-rate" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Default VAT Rate (e.g. 0.15 for 15%)</label>
          <input id="tax-rate" type="number" step="0.01" value={settings.taxRate || '0.15'} onChange={e => setSettings(s => ({ ...s, taxRate: e.target.value }))} style={inputStyle} />
        </div>

        <div>
          <label htmlFor="expiry-alert-days" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Expiry Alert Threshold (Days)</label>
          <input id="expiry-alert-days" type="number" value={settings.expiryAlertDays || '30'} onChange={e => setSettings(s => ({ ...s, expiryAlertDays: e.target.value }))} style={inputStyle} />
        </div>

        <button
          type="submit"
          disabled={saving}
          id="save-settings-btn"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            padding: '11px 20px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(15,110,92,0.35)',
            fontFamily: "'Space Grotesk', sans-serif", width: 'fit-content', marginTop: 8,
          }}
        >
          {saving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={15} /> Save Changes</>}
        </button>
      </form>
    </div>
  );
};
