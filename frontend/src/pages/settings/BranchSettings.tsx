import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { settingsApi } from '../../api/users';
import toast from 'react-hot-toast';

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
      toast.success('Settings saved');
    } catch { toast.error('Failed to save settings'); } finally { setSaving(false); }
  };

  if (loading) return <div className="text-ink-muted text-sm">Loading settings...</div>;

  return (
    <div className="card p-6 max-w-lg">
      <h2 className="font-display font-semibold text-ink mb-4">Branch & Currency</h2>
      <form onSubmit={handleSave} className="space-y-4">
        {[
          ['branch-name', 'Branch name', 'text', settings.branchName || '', (v: string) => setSettings(s => ({ ...s, branchName: v }))],
          ['currency', 'Currency', 'text', settings.currency || 'ETB', (v: string) => setSettings(s => ({ ...s, currency: v }))],
          ['tax-rate', 'Default VAT rate (e.g. 0.15 for 15%)', 'number', settings.taxRate || '0.15', (v: string) => setSettings(s => ({ ...s, taxRate: v }))],
          ['expiry-alert-days', 'Expiry alert days', 'number', settings.expiryAlertDays || '30', (v: string) => setSettings(s => ({ ...s, expiryAlertDays: v }))],
        ].map(([id, label, type, value, onChange]) => (
          <div key={id as string} className="flex flex-col gap-1">
            <label htmlFor={id as string} className="text-sm font-medium text-ink">{label as string}</label>
            <input id={id as string} type={type as string} step={type === 'number' ? '0.01' : undefined}
              value={value as string} onChange={e => (onChange as (v: string) => void)(e.target.value)}
              className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
        ))}
        <Button type="submit" loading={saving} id="save-settings-btn">Save changes</Button>
      </form>
    </div>
  );
};
