'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchBalances } from '@/lib/erc20';
import type { Balances } from '@/types';

const POLL_INTERVAL = 15_000; // 15 seconds

export function useBalances(address: string | null) {
  const [balances, setBalances] = useState<Balances>({
    USDC: '—',
    EURC: '—',
    cirBTC: '—',
    loading: false,
    lastUpdated: null,
  });

  const refresh = useCallback(async () => {
    if (!address) return;
    setBalances(b => ({ ...b, loading: true }));
    try {
      const data = await fetchBalances(address);
      setBalances({ ...data, loading: false, lastUpdated: Date.now() });
    } catch {
      setBalances(b => ({ ...b, loading: false }));
    }
  }, [address]);

  // Initial load + poll
  useEffect(() => {
    if (!address) {
      setBalances({ USDC: '—', EURC: '—', cirBTC: '—', loading: false, lastUpdated: null });
      return;
    }
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [address, refresh]);

  return { balances, refresh };
}
