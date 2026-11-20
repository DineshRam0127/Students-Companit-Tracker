import React from 'react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => {
        let iconSvg = (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4f46e5" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );

        if (t.type === 'success') {
          iconSvg = (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          );
        } else if (t.type === 'danger') {
          iconSvg = (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          );
        }

        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {iconSvg}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
              onClick={() => onDismiss(t.id)}
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
