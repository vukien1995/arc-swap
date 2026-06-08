# ARC Swap DApp

Production-grade DApp swap USDC ↔ EURC ↔ cirBTC trên **Arc Testnet**, sử dụng Circle App Kit SDK chính thức.

## ✅ Tính năng thực

| Tính năng | Chi tiết |
|-----------|---------|
| **Real swap** | Gọi `kit.swap()` → Circle App Kit → on-chain transaction thật |
| **Real quote** | Gọi `kit.estimateSwap()` → amountOut thật, stopLimit, fees |
| **Balance realtime** | Đọc balances từ Arc Testnet RPC qua viem `getBalance` + ERC-20 |
| **6 cặp swap** | USDC↔EURC, USDC↔cirBTC, EURC↔cirBTC (cả 2 chiều) |
| **Slippage** | 0.1% → 5% + custom, convert sang `slippageBps` cho SDK |
| **Price impact** | Tính từ estimatedOutput, cảnh báo ≥1%, nguy hiểm ≥5% |
| **Confirm modal** | Review chi tiết trước khi ký |
| **Tx history** | Lưu lịch sử swap trong session, link đến Explorer |
| **Auto network switch** | Tự switch/add Arc Testnet (5042002) khi connect ví |
| **Error handling** | Phân biệt: user rejected, insufficient balance, slippage, network error |

## 🚀 Deploy lên Vercel

### Bước 1 — Push GitHub

```bash
cd arc-swap-dapp
git init
git add .
git commit -m "feat: Arc Swap DApp"
gh repo create arc-swap --public --push
# hoặc manual: git remote add origin https://github.com/<user>/arc-swap.git && git push -u origin main
```

### Bước 2 — Import vào Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import repo
2. Framework tự nhận **Next.js** ✓
3. **Environment Variables** → Add:
   ```
   NEXT_PUBLIC_KIT_KEY = KIT_KEY:your_id:your_secret
   ```
4. **Deploy** ✓

### Bước 3 — Chuẩn bị

| Thứ cần | Link |
|---------|------|
| Kit Key (miễn phí) | [console.circle.com](https://console.circle.com) |
| Testnet tokens | [faucet.circle.com](https://faucet.circle.com) |
| MetaMask | [metamask.io](https://metamask.io) |

## 💻 Chạy local

```bash
npm install
cp .env.example .env.local
# Điền NEXT_PUBLIC_KIT_KEY=KIT_KEY:...

npm run dev
# → http://localhost:3000
```

## 🏗️ Architecture

```
src/
├── app/
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main DApp page
├── components/
│   ├── swap/
│   │   ├── SwapCard.tsx   # Swap UI + quote debounce
│   │   ├── TokenSelector.tsx
│   │   ├── SlippageControl.tsx
│   │   ├── QuoteDetails.tsx
│   │   ├── ConfirmModal.tsx
│   │   └── TxHistory.tsx
│   ├── wallet/
│   │   ├── WalletButton.tsx
│   │   └── BalanceBar.tsx
│   └── ui/
│       ├── TokenIcon.tsx
│       └── Toast.tsx
├── hooks/
│   ├── useWallet.ts       # MetaMask + Arc Testnet auto-switch
│   ├── useBalances.ts     # Real-time balances (15s poll)
│   └── useSwap.ts         # AppKit estimateSwap + swap
├── lib/
│   ├── arcKit.ts          # Singleton AppKit + adapter factory
│   ├── erc20.ts           # Read on-chain balances via viem
│   └── constants.ts       # Token metadata, network config
└── types/
    └── index.ts
```

## 🔧 SDK Integration

```typescript
// Real estimateSwap (get quote)
const estimate = await kit.estimateSwap({
  from: { adapter, chain: 'Arc_Testnet' },
  tokenIn: 'USDC',
  tokenOut: 'EURC',
  amountIn: '10.00',
  config: { slippageBps: 50, kitKey: process.env.NEXT_PUBLIC_KIT_KEY },
});
// estimate.estimatedOutput.amount → '9.2150'
// estimate.stopLimit.amount      → '9.1685'  (with 0.5% slippage)
// estimate.fees                  → [{ type: 'provider', token: 'USDC', amount: '0.01' }]

// Real swap (executes on-chain)
const result = await kit.swap({
  from: { adapter, chain: 'Arc_Testnet' },
  tokenIn: 'USDC',
  tokenOut: 'EURC',
  amountIn: '10.00',
  config: {
    slippageBps: 50,
    allowanceStrategy: 'permit',  // tries EIP-2612 permit first
    kitKey: process.env.NEXT_PUBLIC_KIT_KEY,
  },
});
// result.txHash      → '0xabc...'
// result.explorerUrl → 'https://testnet.arcscan.app/tx/0xabc...'
// result.amountOut   → '9.2138'
```

## Arc Testnet

| Field | Value |
|-------|-------|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| Gas Token | USDC (18 decimals native) |
| USDC | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
