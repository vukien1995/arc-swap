import { NextRequest, NextResponse } from 'next/server';

// All Circle App Kit calls happen server-side to avoid CORS
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tokenIn, tokenOut, amountIn, slippageBps, kitKey } = body;

    if (!tokenIn || !tokenOut || !amountIn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resolvedKitKey = kitKey || process.env.NEXT_PUBLIC_KIT_KEY;
    if (!resolvedKitKey) {
      return NextResponse.json({ error: 'Kit key not configured' }, { status: 400 });
    }

    const privateKey = process.env.WALLET_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({ error: 'WALLET_PRIVATE_KEY not set in environment' }, { status: 500 });
    }

    // Dynamic import — runs server-side only (Node.js), no CORS issues
    const { AppKit } = await import('@circle-fin/app-kit');
    const { createViemAdapterFromPrivateKey } = await import('@circle-fin/adapter-viem-v2');

    const kit = new AppKit();
    const adapter = createViemAdapterFromPrivateKey({ privateKey });

    if (action === 'estimate') {
      const result = await kit.estimateSwap({
        from: { adapter, chain: 'Arc_Testnet' },
        tokenIn,
        tokenOut,
        amountIn,
        config: {
          kitKey: resolvedKitKey,
          slippageBps: slippageBps ?? 50,
        },
      });
      return NextResponse.json(result);
    }

    // action === 'swap'
    const result = await kit.swap({
      from: { adapter, chain: 'Arc_Testnet' },
      tokenIn,
      tokenOut,
      amountIn,
      config: {
        kitKey: resolvedKitKey,
        slippageBps: slippageBps ?? 50,
      },
    });
    return NextResponse.json(result);

  } catch (err: any) {
    console.error('[swap api]', err);
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
