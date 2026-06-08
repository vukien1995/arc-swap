'use client';

import { useState, useEffect, useCallback } from 'react';
import { ARC_TESTNET } from '@/lib/constants';
import type { WalletState } from '@/types';

const ARC_CHAIN_PARAMS = {
  chainId: ARC_TESTNET.chainIdHex,
  chainName: ARC_TESTNET.name,
  nativeCurrency: ARC_TESTNET.nativeCurrency,
  rpcUrls: [ARC_TESTNET.rpcUrl],
  blockExplorerUrls: [ARC_TESTNET.explorerUrl],
};

function getEth() {
  if (typeof window === 'undefined') return null;
  return (window as any).ethereum ?? null;
}

function shortAddr(addr: string) {
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isArcTestnet: false,
    isConnecting: false,
    error: null,
  });

  // ── Init: check already-connected accounts ───────────────────────────────
  useEffect(() => {
    const eth = getEth();
    if (!eth) return;

    const syncChain = async () => {
      try {
        const hexId: string = await eth.request({ method: 'eth_chainId' });
        const id = parseInt(hexId, 16);
        setState(s => ({ ...s, chainId: id, isArcTestnet: id === ARC_TESTNET.chainId }));
      } catch {}
    };

    eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        setState(s => ({ ...s, address: accounts[0] }));
        syncChain();
      }
    }).catch(() => {});

    const onAccounts = (accounts: string[]) => {
      setState(s => ({ ...s, address: accounts[0] ?? null }));
    };
    const onChain = (hexId: string) => {
      const id = parseInt(hexId, 16);
      setState(s => ({ ...s, chainId: id, isArcTestnet: id === ARC_TESTNET.chainId }));
    };

    eth.on('accountsChanged', onAccounts);
    eth.on('chainChanged', onChain);

    return () => {
      eth.removeListener('accountsChanged', onAccounts);
      eth.removeListener('chainChanged', onChain);
    };
  }, []);

  // ── Switch / add Arc Testnet ─────────────────────────────────────────────
  const switchToArc = useCallback(async () => {
    const eth = getEth();
    if (!eth) return;
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainIdHex }],
      });
    } catch (switchErr: any) {
      if (switchErr.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [ARC_CHAIN_PARAMS],
        });
      } else {
        throw switchErr;
      }
    }
  }, []);

  // ── Connect ──────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    const eth = getEth();
    if (!eth) {
      setState(s => ({ ...s, error: 'MetaMask not installed. Please install it.' }));
      return;
    }
    setState(s => ({ ...s, isConnecting: true, error: null }));
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (!accounts.length) throw new Error('No accounts returned');
      setState(s => ({ ...s, address: accounts[0], isConnecting: false }));
      await switchToArc();
    } catch (err: any) {
      const msg = err?.code === 4001 ? 'User rejected the connection request.' : (err?.message ?? 'Connection failed');
      setState(s => ({ ...s, isConnecting: false, error: msg }));
    }
  }, [switchToArc]);

  // ── Disconnect ───────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    setState({ address: null, chainId: null, isArcTestnet: false, isConnecting: false, error: null });
  }, []);

  return {
    ...state,
    shortAddress: state.address ? shortAddr(state.address) : null,
    connect,
    disconnect,
    switchToArc,
    hasMetaMask: typeof window !== 'undefined' && !!(window as any).ethereum,
  };
}
