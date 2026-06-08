'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TokenSelector } from './TokenSelector';
import { QuoteDetails } from './QuoteDetails';
import { ConfirmModal } from './ConfirmModal';
import { useSwap } from '@/hooks/useSwap';
import { DEFAULT_SLIPPAGE, PRICE_IMPACT_WARNING, SLIPPAGE_PRESETS } from '@/lib/constants';
import { toast } from '@/components/ui/Toast';
import type { Token, Balances } from '@/types';
import type { useWallet } from '@/hooks/useWallet';

interface Props {
  wallet: ReturnType<typeof useWallet>;
  balances: Balances;
  onSwapSuccess: () => void;
}

export function SwapCard({ wallet, balances, onSwapSuccess }: Props) {
  const [tokenIn, setTokenIn] = useState<Token>('USDC');
  const [tokenOut, setTokenOut] = useState<Token>('EURC');
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [kitKey, setKitKey] = useState(process.env.NEXT_PUBLIC_KIT_KEY ?? '');
  const [kitKeyVisible, setKitKeyVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { status, quote, result, error, getQuote, executeSwap, reset } = useSwap();

  const isLoading = status === 'quoting' || status === 'swapping';
  const isConnected = !!wallet.address && wallet.isArcTestnet;
  const currentBalance = wallet.address ? balances[tokenIn] : '—';
  const insufficient = wallet.address && currentBalance !== '—' && amountIn
    ? parseFloat(amountIn) > parseFloat(currentBalance) : false;
  const amountOut = quote?.estimatedOutput ?? '';

  useEffect(() => {
    if (!isConnected || !amountIn || parseFloat(amountIn) <= 0) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      getQuote(tokenIn, tokenOut, amountIn, slippage, kitKey);
    }, 700);
    return () => clearTimeout(debounceRef.current);
  }, [amountIn, tokenIn, tokenOut, slippage, kitKey, isConnected]);

  useEffect(() => {
    if (status === 'success' && result) {
      toast(`⚡ Swapped ${result.amountIn} ${result.tokenIn} → ${result.amountOut} ${result.tokenOut}`, 'success', {
        label: 'View on Explorer ↗',
        href: result.explorerUrl,
      });
      setShowConfirm(false);
      setAmountIn('');
      reset();
      onSwapSuccess();
    }
    if (status === 'error' && error) {
      toast(error.slice(0, 120), 'error');
      setShowConfirm(false);
    }
  }, [status, result, error]);

  const handleFlip = useCallback(() => {
    setTokenIn(tokenOut); setTokenOut(tokenIn);
    setAmountIn(quote?.estimatedOutput ?? '');
    reset();
  }, [tokenIn, tokenOut, quote, reset]);

  // Button state
  let btnLabel = `Swap ${tokenIn} → ${tokenOut}`;
  let btnDisabled = false;
  let btnAction = () => setShowConfirm(true);

  if (!wallet.address) { btnLabel = 'Connect Wallet'; btnDisabled = true; }
  else if (!wallet.isArcTestnet) { btnLabel = 'Switch to Arc Testnet'; btnDisabled = false; btnAction = wallet.switchToArc; }
  else if (!kitKey.trim()) { btnLabel = 'Enter Kit Key'; btnDisabled = true; }
  else if (!amountIn || parseFloat(amountIn) <= 0) { btnLabel = 'Enter Amount'; btnDisabled = true; }
  else if (insufficient) { btnLabel = `Insufficient ${tokenIn}`; btnDisabled = true; }
  else if (status === 'quoting') { btnLabel = 'Getting Quote…'; btnDisabled = true; }
  else if (!quote) { btnLabel = `Swap ${tokenIn} → ${tokenOut}`; btnDisabled = true; }

  const s: Record<string, React.CSSProperties> = {
    label: { fontSize: 11, fontFamily: 'Space Mono, monospace', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 },
    field: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 14px' },
    input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 26, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#fff', minWidth: 0 },
  };

  return (
    <>
      <style>{`
        @keyframes rotate-slow { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: 2 }}>SWAP</span>
        <button onClick={() => setShowSettings(s => !s)}
          style={{ background: showSettings ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${showSettings ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14, color: showSettings ? '#00e5ff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
          ⚙
        </button>
      </div>

      <div style={{ padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Settings panel */}
        {showSettings && (
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Kit key */}
            <div>
              <div style={{ ...s.label, display: 'flex', justifyContent: 'space-between' }}>
                <span>Circle Kit Key</span>
                <a href="https://console.circle.com" target="_blank" rel="noopener" style={{ color: '#00e5ff', textDecoration: 'none', fontSize: 10 }}>Get free ↗</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={kitKeyVisible ? 'text' : 'password'} value={kitKey} onChange={e => setKitKey(e.target.value)}
                  placeholder="KIT_KEY:id:secret"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 36px 8px 10px', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: 11, outline: 'none' }} />
                <button onClick={() => setKitKeyVisible(v => !v)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                  {kitKeyVisible ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            {/* Slippage */}
            <div>
              <div style={s.label}>Slippage</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SLIPPAGE_PRESETS.map(v => (
                  <button key={v} onClick={() => setSlippage(v)}
                    style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'Space Mono, monospace', cursor: 'pointer', border: `1px solid ${slippage === v ? 'rgba(0,229,255,0.5)' : 'rgba(255,255,255,0.1)'}`, background: slippage === v ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.03)', color: slippage === v ? '#00e5ff' : 'rgba(255,255,255,0.5)', transition: 'all 0.15s' }}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Token In */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={s.label}>You Pay</span>
            {wallet.address && (
              <button onClick={() => setAmountIn(parseFloat(currentBalance || '0').toString())}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontFamily: 'Space Mono, monospace', color: 'rgba(0,229,255,0.6)' }}>
                Balance: {currentBalance} {tokenIn}
              </button>
            )}
          </div>
          <div style={{ ...s.field, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="number" value={amountIn} onChange={e => { setAmountIn(e.target.value); reset(); }}
              placeholder="0.00" min="0" style={s.input} />
            <TokenSelector value={tokenIn} exclude={tokenOut} onChange={t => { setTokenIn(t); reset(); }} />
          </div>
        </div>

        {/* Flip */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleFlip}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)'; e.currentTarget.style.color = '#00e5ff'; e.currentTarget.style.transform = 'rotate(180deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}>
            ⇅
          </button>
        </div>

        {/* Token Out */}
        <div>
          <div style={s.label}>You Receive</div>
          <div style={{ ...s.field, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, fontSize: 26, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: amountOut ? '#00e676' : 'rgba(255,255,255,0.2)' }}>
              {status === 'quoting'
                ? <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Fetching…</span>
                : amountOut ? `≈${parseFloat(amountOut).toFixed(tokenOut === 'cirBTC' ? 8 : 4)}` : '0.00'}
            </div>
            <TokenSelector value={tokenOut} exclude={tokenIn} onChange={t => { setTokenOut(t); reset(); }} />
          </div>
        </div>

        {/* Quote details */}
        {quote && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 12px' }}>
            <QuoteDetails quote={quote} slippage={slippage} />
          </div>
        )}

        {/* Price impact warning */}
        {quote && quote.priceImpact >= PRICE_IMPACT_WARNING && (
          <div style={{ background: quote.priceImpact >= 5 ? 'rgba(255,80,80,0.08)' : 'rgba(255,200,50,0.08)', border: `1px solid ${quote.priceImpact >= 5 ? 'rgba(255,80,80,0.3)' : 'rgba(255,200,50,0.3)'}`, borderRadius: 10, padding: '8px 12px', fontSize: 12, fontFamily: 'Space Mono, monospace', color: quote.priceImpact >= 5 ? '#ff8080' : '#ffc832' }}>
            ⚠️ Price impact: {quote.priceImpact.toFixed(2)}%{quote.priceImpact >= 5 && ' — High risk!'}
          </div>
        )}

        {/* Insufficient */}
        {insufficient && (
          <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontFamily: 'Space Mono, monospace', color: '#ff8080' }}>
            Insufficient {tokenIn} balance
          </div>
        )}

        {/* Swap Button */}
        <button onClick={btnAction} disabled={btnDisabled || isLoading}
          style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none', cursor: btnDisabled || isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'Orbitron, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: 1,
            transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            ...(btnDisabled || isLoading
              ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.08)' }
              : { background: 'linear-gradient(135deg, #00e5ff 0%, #7850ff 50%, #ff50c8 100%)', color: '#fff', boxShadow: '0 0 30px rgba(0,229,255,0.3), 0 0 60px rgba(120,80,255,0.15)' }),
          }}>
          {isLoading ? (
            <>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'rotate-slow 0.7s linear infinite' }} />
              {status === 'quoting' ? 'Getting Quote…' : 'Swapping…'}
            </>
          ) : btnLabel}
        </button>
      </div>

      {showConfirm && quote && (
        <ConfirmModal quote={quote} slippage={slippage} kitKey={kitKey}
          onConfirm={() => executeSwap(kitKey, slippage)}
          onCancel={() => setShowConfirm(false)}
          loading={status === 'swapping'} />
      )}
    </>
  );
}
