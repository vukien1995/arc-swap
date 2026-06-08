export type Token = 'USDC' | 'EURC' | 'cirBTC';

export interface TokenMeta {
  symbol: Token;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  decimals: number;
  address: string; // Arc Testnet contract address
}

export interface SwapQuote {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  estimatedOutput: string;
  stopLimit: string;   // min output after slippage
  fees: FeeItem[];
  priceImpact: number; // percent
  fromAddress: string;
  toAddress: string;
}

export interface FeeItem {
  type: string;
  token: string;
  amount: string;
}

export interface SwapResult {
  txHash: string;
  explorerUrl: string;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOut: string;
  fees: FeeItem[];
  timestamp: number;
}

export interface TxRecord {
  txHash: string;
  explorerUrl?: string;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOut: string;
  timestamp: number;
  status: 'success' | 'error';
  error?: string;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isArcTestnet: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface Balances {
  USDC: string;
  EURC: string;
  cirBTC: string;
  loading: boolean;
  lastUpdated: number | null;
}
