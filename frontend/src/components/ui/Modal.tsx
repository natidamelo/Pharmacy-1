import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeWidths = {
  sm: 380,
  md: 480,
  lg: 600,
  xl: 720,
};

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      }}
      aria-modal="true" role="dialog" aria-labelledby="modal-title"
    >
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: sizeWidths[size],
        backgroundColor: '#ffffff', borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
        border: '1px solid #E8EDE9', zIndex: 10,
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #EEF2F0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0F6E5C 0%, #0d9488 100%)',
        }}>
          <h2 id="modal-title" style={{
            fontSize: 16, fontWeight: 700, color: '#ffffff', margin: 0,
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.3px',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
              cursor: 'pointer', padding: 5, display: 'flex', alignItems: 'center', color: '#fff',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', color: '#0D1117' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
            padding: '14px 24px', borderTop: '1px solid #EEF2F0', backgroundColor: '#FAFAFA',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', loading = false
}) => (
  <Modal open={open} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>
    }
  >
    <p style={{ fontSize: 14, color: '#4A5568', margin: 0, lineHeight: 1.5 }}>{message}</p>
  </Modal>
);
