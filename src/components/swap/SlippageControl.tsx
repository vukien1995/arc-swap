'use client';

import { useState } from 'react';
import { SLIPPAGE_PRESETS, DEFAULT_SLIPPAGE } from '@/lib/constants';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function SlippageControl({ value, onChange }: Props) {
  const [custom, setCustom] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleCustom = (v: string) => {
    setCustom(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0 && n <= 50) onChange(n);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-mono text-arc-muted uppercase tracking-wider flex-shrink-0">
        Slippage
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {SLIPPAGE_PRESETS.map(v => (
          <button
            key={v}
            onClick={() => { onChange(v); setShowCustom(false); setCustom(''); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
              value === v && !showCustom
                ? 'border-arc-accent text-arc-accent bg-arc-accent/10'
                : 'border-arc-border text-arc-muted hover:border-arc-accent/50 hover:text-arc-text bg-arc-surface'
            }`}
          >
            {v}%
          </button>
        ))}
        <button
          onClick={() => setShowCustom(v => !v)}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
            showCustom
              ? 'border-arc-accent text-arc-accent bg-arc-accent/10'
              : 'border-arc-border text-arc-muted hover:border-arc-accent/50 bg-arc-surface'
          }`}
        >
          Custom
        </button>
        {showCustom && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={custom}
              onChange={e => handleCustom(e.target.value)}
              placeholder="0.5"
              min="0.01"
              max="50"
              step="0.1"
              className="w-16 bg-arc-surface border border-arc-accent/30 text-arc-text text-xs font-mono rounded-lg px-2 py-1 outline-none focus:border-arc-accent"
            />
            <span className="text-xs text-arc-muted font-mono">%</span>
          </div>
        )}
      </div>
    </div>
  );
}
