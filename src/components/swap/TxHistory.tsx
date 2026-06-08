'use client';

import { TokenIcon } from '@/components/ui/TokenIcon';
import { ARC_TESTNET } from '@/lib/constants';
import type { TxRecord } from '@/types';

interface Props {
  history: TxRecord[];
  onClear: () => void;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function TxHistory({ history, onClear }: Props) {
  if (history.length === 0) {
    return (
      <div className="bg-arc-panel border border-arc-border rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">📋</div>
        <p className="text-arc-muted text-sm font-mono">No transactions yet</p>
        <a href={ARC_TESTNET.explorerUrl} target="_blank" rel="noopener"
          className="text-xs text-arc-accent hover:underline mt-1 block">
          View all txns on Explorer ↗
        </a>
      </div>
    );
  }

  return (
    <div className="bg-arc-panel border border-arc-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-arc-border">
        <h3 className="font-bold text-arc-text text-sm" style={{ fontFamily: 'var(--font-syne)' }}>
          Transaction History
        </h3>
        <button onClick={onClear} className="text-xs font-mono text-arc-muted hover:text-arc-red transition-colors">
          Clear
        </button>
      </div>
      <div className="divide-y divide-arc-border">
        {history.map((tx, i) => (
          <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-arc-surface/50 transition-colors">
            {/* Status */}
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tx.status === 'success' ? 'bg-arc-green' : 'bg-arc-red'}`} />

            {/* Tokens */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <TokenIcon token={tx.tokenIn} size={18} />
              <span className="text-arc-muted text-xs">→</span>
              <TokenIcon token={tx.tokenOut} size={18} />
            </div>

            {/* Amounts */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono text-arc-text truncate">
                {tx.amountIn} {tx.tokenIn}
                {tx.status === 'success' && (
                  <span className="text-arc-green"> → {tx.amountOut} {tx.tokenOut}</span>
                )}
                {tx.status === 'error' && (
                  <span className="text-arc-red"> failed</span>
                )}
              </div>
              {tx.error && (
                <div className="text-xs font-mono text-arc-red/70 truncate mt-0.5">{tx.error.slice(0, 50)}</div>
              )}
            </div>

            {/* Time + link */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-mono text-arc-muted">{timeAgo(tx.timestamp)}</span>
              {tx.txHash && tx.explorerUrl && (
                <a href={tx.explorerUrl} target="_blank" rel="noopener"
                  className="text-arc-accent text-xs hover:underline">↗</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
