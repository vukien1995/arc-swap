'use client';

import { useWallet } from '@/hooks/useWallet';
import { ARC_TESTNET } from '@/lib/constants';

interface Props {
  wallet: ReturnType<typeof useWallet>;
}

export function WalletButton({ wallet }: Props) {
  if (wallet.address) {
    return (
      <div className="flex items-center gap-2">
        {!wallet.isArcTestnet && (
          <button
            onClick={wallet.switchToArc}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-arc-red/40 text-arc-red hover:bg-arc-red/10 transition-colors"
          >
            Wrong Network
          </button>
        )}
        <button
          onClick={wallet.disconnect}
          className="flex items-center gap-2 bg-arc-panel border border-arc-border rounded-2xl px-4 py-2 text-sm font-mono hover:border-arc-red/50 transition-all group"
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${wallet.isArcTestnet ? 'bg-arc-green shadow-[0_0_6px_#00e676]' : 'bg-arc-red'}`}
          />
          <span className="text-arc-text group-hover:text-arc-red transition-colors">
            {wallet.shortAddress}
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={wallet.connect}
      disabled={wallet.isConnecting}
      className="flex items-center gap-2 bg-arc-accent text-black font-bold rounded-2xl px-5 py-2 text-sm hover:bg-arc-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
    >
      {wallet.isConnecting ? (
        <>
          <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          Connecting…
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 1 0 0 4h3a1 1 0 0 0 1-1v-2.5"/>
            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
}
