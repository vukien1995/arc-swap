'use client';
import { useState, useCallback, useEffect } from 'react';
export type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ToastItem { id: number; msg: string; type: ToastType; link?: { label: string; href: string }; }
let _fn: ((m: string, t: ToastType, l?: ToastItem['link']) => void) | null = null;
export function toast(msg: string, type: ToastType = 'info', link?: ToastItem['link']) { _fn?.(msg, type, link); }
let _id = 0;
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const add = useCallback((msg: string, type: ToastType, link?: ToastItem['link']) => {
    const id = ++_id;
    setItems(s => [...s, { id, msg, type, link }]);
    setTimeout(() => setItems(s => s.filter(x => x.id !== id)), 5000);
  }, []);
  useEffect(() => { _fn = add; return () => { _fn = null; }; }, [add]);
  const colors = { success: 'rgba(0,230,118,0.3)', error: 'rgba(255,82,82,0.3)', info: 'rgba(0,229,255,0.2)', warning: 'rgba(255,200,50,0.3)' };
  const text = { success: '#00e676', error: '#ff5252', info: '#00e5ff', warning: '#ffc832' };
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      {items.map(t => (
        <div key={t.id} style={{ background: 'rgba(10,8,40,0.95)', backdropFilter: 'blur(16px)', border: `1px solid ${colors[t.type]}`, borderRadius: 12, padding: '12px 16px', fontSize: 13, maxWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.6)', color: text[t.type], fontFamily: 'Inter, sans-serif' }}>
          <div>{t.msg}</div>
          {t.link && <a href={t.link.href} target="_blank" rel="noopener" style={{ color: '#00e5ff', fontSize: 11, textDecoration: 'none', marginTop: 4, display: 'block' }}>{t.link.label}</a>}
        </div>
      ))}
    </div>
  );
}
