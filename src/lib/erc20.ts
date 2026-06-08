import { createPublicClient, http, parseAbi } from 'viem';
import { ARC_TESTNET, TOKEN_META } from './constants';
import type { Token, Balances } from '@/types';

const arcChain = {
  id: ARC_TESTNET.chainId,
  name: ARC_TESTNET.name,
  nativeCurrency: ARC_TESTNET.nativeCurrency,
  rpcUrls: { default: { http: [ARC_TESTNET.rpcUrl] } },
} as const;

const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(ARC_TESTNET.rpcUrl),
});

const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
]);

async function readBalance(tokenAddress: string, walletAddress: string, decimals: number): Promise<string> {
  try {
    const raw = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    });
    // Format to human-readable
    const divisor = BigInt(10 ** decimals);
    const whole = raw / divisor;
    const frac = raw % divisor;
    const fracStr = frac.toString().padStart(decimals, '0').slice(0, 4);
    return `${whole}.${fracStr}`;
  } catch {
    return '0.0000';
  }
}

// USDC on Arc uses the native balance (18 decimals), but also has ERC-20 interface (6 decimals)
async function readNativeBalance(walletAddress: string): Promise<string> {
  try {
    const raw = await publicClient.getBalance({
      address: walletAddress as `0x${string}`,
    });
    // Native USDC = 18 decimals
    const divisor = BigInt(10 ** 18);
    const whole = raw / divisor;
    const frac = raw % divisor;
    const fracStr = frac.toString().padStart(18, '0').slice(0, 4);
    return `${whole}.${fracStr}`;
  } catch {
    return '0.0000';
  }
}

export async function fetchBalances(walletAddress: string): Promise<Omit<Balances, 'loading' | 'lastUpdated'>> {
  const [usdc, eurc, cirbtc] = await Promise.all([
    // USDC: use native balance (gas token on Arc)
    readNativeBalance(walletAddress),
    // EURC: ERC-20 at known address
    readBalance(TOKEN_META.EURC.address, walletAddress, TOKEN_META.EURC.decimals),
    // cirBTC: ERC-20 — if address unknown, returns 0
    TOKEN_META.cirBTC.address !== '0x0000000000000000000000000000000000000000'
      ? readBalance(TOKEN_META.cirBTC.address, walletAddress, TOKEN_META.cirBTC.decimals)
      : Promise.resolve('0.0000'),
  ]);

  return { USDC: usdc, EURC: eurc, cirBTC: cirbtc };
}
