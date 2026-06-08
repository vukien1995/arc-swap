'use client';
import { useState, useRef, useEffect } from 'react';
import { ALL_TOKENS, TOKEN_META } from '@/lib/constants';
import type { Token } from '@/types';

interface Props { value: Token; exclude?: Token; onChange: (t: Token) => void; disabled?: boolean; }

export function TokenSelector({ value, exclude, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const meta = TOKEN_META[value];
  const options = ALL_TOKENS.filter(t => t !== exclude);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => !disabled && setOpen(o => !o)} disabled={disabled}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '7px 12px 7px 8px', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => !disabled && (e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', boxShadow: `0 0 10px ${meta.color}60`, flexShrink: 0 }}>{meta.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Space Mono, monospace' }}>{value}</span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 100, background: 'rgba(10,8,40,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, minWidth: 170, boxShadow: '0 8px 32px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
          {options.map(t => {
            const m = TOKEN_META[t];
            return (
              <button key={t} onClick={() => { onChange(t); setOpen(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: t === value ? 'rgba(0,229,255,0.06)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = t === value ? 'rgba(0,229,255,0.06)' : 'transparent')}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', boxShadow: `0 0 8px ${m.color}50` }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Space Mono, monospace' }}>{t}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{m.name}</div>
                </div>
                {t === value && <span style={{ marginLeft: 'auto', color: '#00e5ff', fontSize: 11 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
