'use client';
import { PRICE_IMPACT_WARNING, PRICE_IMPACT_DANGER } from '@/lib/constants';
import type { SwapQuote } from '@/types';

interface Props { quote: SwapQuote; slippage: number; }

export function QuoteDetails({ quote, slippage }: Props) {
  const ic = quote.priceImpact >= PRICE_IMPACT_DANGER ? '#ff5252' : quote.priceImpact >= PRICE_IMPACT_WARNING ? '#ffc832' : '#00e676';
  const rows = [
    ['Estimated output', `${parseFloat(quote.estimatedOutput).toFixed(quote.tokenOut === 'cirBTC' ? 8 : 4)} ${quote.tokenOut}`, '#00e676'],
    [`Min. received (${slippage}%)`, `${parseFloat(quote.stopLimit).toFixed(quote.tokenOut === 'cirBTC' ? 8 : 4)} ${quote.tokenOut}`, 'rgba(255,255,255,0.7)'],
    ['Price impact', `${quote.priceImpact.toFixed(2)}%`, ic],
    ...quote.fees.map(f => [`Fee (${f.type})`, `${f.amount} ${f.token}`, 'rgba(255,255,255,0.4)']),
    ['Route', `${quote.tokenIn} → ${quote.tokenOut}`, 'rgba(0,229,255,0.7)'],
  ] as [string, string, string][];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map(([k, v, c]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{k}</span>
          <span style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: c, fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
