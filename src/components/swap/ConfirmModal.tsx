'use client';
import { TOKEN_META, PRICE_IMPACT_DANGER } from '@/lib/constants';
import { QuoteDetails } from './QuoteDetails';
import type { SwapQuote } from '@/types';

interface Props { quote: SwapQuote; slippage: number; kitKey: string; onConfirm: () => void; onCancel: () => void; loading: boolean; }

export function ConfirmModal({ quote, slippage, onConfirm, onCancel, loading }: Props) {
  const highImpact = quote.priceImpact >= PRICE_IMPACT_DANGER;
  const mIn = TOKEN_META[quote.tokenIn]; const mOut = TOKEN_META[quote.tokenOut];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={onCancel} />
      <div style={{ position: 'relative', background: 'rgba(10,8,40,0.97)', border: '1px solid rgba(120,80,255,0.3)', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 0 60px rgba(120,80,255,0.2)' }}>
        <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: 1 }}>Confirm Swap</h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono, monospace', marginBottom: 20 }}>Review before signing the transaction</p>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: mIn.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: `0 0 12px ${mIn.color}60` }}>{mIn.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#fff' }}>{quote.amountIn}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{quote.tokenIn}</div>
            </div>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}>→</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#00e676' }}>≈{parseFloat(quote.estimatedOutput).toFixed(quote.tokenOut === 'cirBTC' ? 8 : 4)}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{quote.tokenOut}</div>
            </div>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: mOut.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: `0 0 12px ${mOut.color}60` }}>{mOut.icon}</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <QuoteDetails quote={quote} slippage={slippage} />
        </div>

        {highImpact && (
          <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#ff8080', fontFamily: 'Space Mono, monospace', marginBottom: 14 }}>
            ⚠️ High price impact ({quote.priceImpact.toFixed(2)}%). You may receive significantly less.
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} disabled={loading}
            style={{ flex: 1, padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Orbitron, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>
            CANCEL
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 1.5, padding: '13px', borderRadius: 12, border: 'none', fontFamily: 'Orbitron, sans-serif', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: highImpact ? 'rgba(255,80,80,0.8)' : 'linear-gradient(135deg, #00e5ff, #7850ff)', color: '#fff', opacity: loading ? 0.7 : 1, boxShadow: '0 0 20px rgba(0,229,255,0.3)' }}>
            {loading ? (
              <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'rotate-slow 0.7s linear infinite' }} />SWAPPING</>
            ) : highImpact ? '⚠️ CONFIRM' : '⚡ CONFIRM'}
          </button>
        </div>
      </div>
    </div>
  );
}
