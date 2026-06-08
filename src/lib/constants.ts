import type { Token, TokenMeta } from '@/types';

export const ARC_TESTNET = {
  chainId: 5042002,
  chainIdHex: '0x4D0512',
  name: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.network',
  explorerUrl: 'https://testnet.arcscan.app',
  faucetUrl: 'https://faucet.circle.com',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
} as const;

export const TOKEN_META: Record<Token, TokenMeta> = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    color: '#2775CA',
    bgColor: 'rgba(39,117,202,0.15)',
    decimals: 6,
    address: '0x3600000000000000000000000000000000000000',
  },
  EURC: {
    symbol: 'EURC',
    name: 'Euro Coin',
    icon: '💶',
    color: '#0050ff',
    bgColor: 'rgba(0,80,255,0.15)',
    decimals: 6,
    address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
  },
  cirBTC: {
    symbol: 'cirBTC',
    name: 'Circle Bitcoin',
    icon: '₿',
    color: '#f7931a',
    bgColor: 'rgba(247,147,26,0.15)',
    decimals: 8,
    address: '0x0000000000000000000000000000000000000000', // placeholder - check docs
  },
};

export const ALL_TOKENS: Token[] = ['USDC', 'EURC', 'cirBTC'];

export const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0, 2.0, 5.0];
export const DEFAULT_SLIPPAGE = 0.5;

// slippage in bps (1 bps = 0.01%)
export function slippageToBps(pct: number): number {
  return Math.round(pct * 100);
}

export const PRICE_IMPACT_WARNING = 1.0;  // warn above 1%
export const PRICE_IMPACT_DANGER  = 5.0;  // danger above 5%

export const APP_CHAIN = 'Arc_Testnet' as const;
