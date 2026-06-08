'use client';
import { useState, useCallback, useRef } from 'react';
import type { Token, SwapQuote, SwapResult } from '@/types';

export type SwapStatus = 'idle' | 'quoting' | 'ready' | 'confirming' | 'swapping' | 'success' | 'error';

type TxStatus = 'success' | 'error';

interface TxRecord {
  txHash: string;
  explorerUrl?: string;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOut: string;
  timestamp: number;
  status: TxStatus;
  error?: string;
}

export function useSwap() {
  const [status, setStatus] = useState<SwapStatus>('idle');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [result, setResult] = useState<SwapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const quoteRef = useRef<{ tokenIn: Token; tokenOut: Token; amountIn: string } | null>(null);

  // ── Call our Next.js API route (server-side, no CORS) ─────────────────────
  const callApi = useCallback(async (action: 'estimate' | 'swap', params: object) => {
    const res = await fetch('/api/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`);
    return data;
  }, []);

  // ── Get quote ─────────────────────────────────────────────────────────────
  const getQuote = useCallback(async (
    tokenIn: Token, tokenOut: Token, amountIn: string,
    slippagePct: number, kitKey: string,
  ) => {
    if (!amountIn || parseFloat(amountIn) <= 0) { setQuote(null); return; }
    setStatus('quoting');
    setError(null);
    try {
      const est = await callApi('estimate', {
        tokenIn, tokenOut, amountIn,
        slippageBps: Math.round(slippagePct * 100),
        kitKey,
      });

      const fees = est.fees
        ? (Array.isArray(est.fees) ? est.fees : [est.fees]).map((f: any) => ({
            type: f.type ?? 'provider',
            token: f.token ?? tokenIn,
            amount: f.amount ?? '0',
          }))
        : [];

      const outAmt = parseFloat(est.estimatedOutput?.amount ?? '0');
      const inAmt  = parseFloat(amountIn);

      const q: SwapQuote = {
        tokenIn, tokenOut, amountIn,
        estimatedOutput: est.estimatedOutput?.amount ?? '0',
        stopLimit:       est.stopLimit?.amount ?? '0',
        fees,
        priceImpact: inAmt > 0 ? Math.abs(1 - outAmt / inAmt) * 100 : 0,
        fromAddress: est.fromAddress ?? '',
        toAddress:   est.toAddress ?? '',
      };
      setQuote(q);
      quoteRef.current = { tokenIn, tokenOut, amountIn };
      setStatus('ready');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to get quote');
      setStatus('error');
      setQuote(null);
    }
  }, [callApi]);

  // ── Execute swap ──────────────────────────────────────────────────────────
  const executeSwap = useCallback(async (kitKey: string, slippagePct: number) => {
    if (!quote || !quoteRef.current) return;
    const { tokenIn, tokenOut, amountIn } = quoteRef.current;
    setStatus('swapping');
    setError(null);
    try {
      const res = await callApi('swap', {
        tokenIn, tokenOut, amountIn,
        slippageBps: Math.round(slippagePct * 100),
        kitKey,
      });

      const fees = res.fees
        ? (Array.isArray(res.fees) ? res.fees : [res.fees]).map((f: any) => ({
            type: f.type ?? 'provider', token: f.token ?? tokenIn, amount: f.amount ?? '0',
          }))
        : [];

      const r: SwapResult = {
        txHash:      res.txHash,
        explorerUrl: res.explorerUrl ?? `https://testnet.arcscan.app/tx/${res.txHash}`,
        tokenIn, tokenOut, amountIn,
        amountOut: res.amountOut ?? quote.estimatedOutput,
        fees,
        timestamp: Date.now(),
      };
      setResult(r);
      setStatus('success');

      const successRecord: TxRecord = {
        txHash: r.txHash, explorerUrl: r.explorerUrl,
        tokenIn, tokenOut, amountIn, amountOut: r.amountOut,
        timestamp: r.timestamp, status: 'success' as TxStatus,
      };
      setTxHistory(h => [successRecord, ...h].slice(0, 20));

    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setError(msg);
      setStatus('error');
      const errorRecord: TxRecord = {
        txHash: '', tokenIn, tokenOut, amountIn, amountOut: '0',
        timestamp: Date.now(), status: 'error' as TxStatus, error: msg,
      };
      setTxHistory(h => [errorRecord, ...h].slice(0, 20));
    }
  }, [quote, callApi]);

  const reset = useCallback(() => {
    setStatus('idle'); setQuote(null); setResult(null);
    setError(null); quoteRef.current = null;
  }, []);

  const clearHistory = useCallback(() => setTxHistory([]), []);

  return { status, quote, result, error, txHistory, getQuote, executeSwap, reset, clearHistory };
}
