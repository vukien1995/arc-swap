'use client';

import { TokenIcon } from '@/components/ui/TokenIcon';
import type { Balances, Token } from '@/types';
import { ARC_TESTNET } from '@/lib/constants';

interface Props {
  balances: Balances;
  address: string;
  onRefresh: () => void;
}

const TOKENS: Token[] = ['USDC', 'EURC', 'cirBTC'];

export function BalanceBar({ balances, address, onRefresh }: Props) {
  return (
    <div className="bg-arc-panel border border-arc-border rounded-2xl px-4 py-3 flex flex-wrap items-center gap-4">
      {/* Address */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="w-2 h-2 rounded-full bg-arc-green shadow-[0_0_6px_#00e676] flex-shrink-0" />
        <span className="font-mono text-xs text-arc-muted truncate">{address}</span>
      </div>

      {/* Balances */}
      <div className="flex items-center gap-4 flex-wrap">
        {TOKENS.map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <TokenIcon token={t} size={18} />
            <span className="font-mono text-xs">
              <span className="text-arc-muted">{t} </span>
              <span className={`text-arc-text ${balances.loading ? 'opacity-50' : ''}`}>
                {balances[t]}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Refresh + Faucet */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          title="Refresh balances"
          className="text-arc-muted hover:text-arc-accent transition-colors p-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={balances.loading ? 'animate-spin' : ''}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
        </button>
        <a
          href={ARC_TESTNET.faucetUrl}
          target="_blank"
          rel="noopener"
          className="text-xs font-mono text-arc-accent/70 hover:text-arc-accent transition-colors border border-arc-accent/20 hover:border-arc-accent/50 rounded-lg px-2 py-0.5"
        >
          Faucet ↗
        </a>
      </div>
    </div>
  );
}
