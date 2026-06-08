'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useBalances } from '@/hooks/useBalances';
import { useSwap } from '@/hooks/useSwap';
import { Toaster, toast } from '@/components/ui/Toast';
import { ARC_TESTNET, TOKEN_META } from '@/lib/constants';
import type { Token } from '@/types';

const SwapCard = dynamic(() => import('@/components/swap/SwapCard').then(m => ({ default: m.SwapCard })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  ),
});

// ── Galaxy canvas background ──────────────────────────────────────────────────
function GalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', resize);

    // Stars
    const STARS = 320;
    const stars = Array.from({ length: STARS }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.15 + 0.02,
      opacity: Math.random() * 0.8 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Galaxy arms
    const PARTICLES = 1800;
    const particles = Array.from({ length: PARTICLES }, (_, i) => {
      const arm = i % 3;
      const t = (i / PARTICLES) * Math.PI * 6 + arm * ((Math.PI * 2) / 3);
      const r = (i / PARTICLES) * 0.45 + 0.02;
      const spread = (Math.random() - 0.5) * 0.08;
      return {
        angle: t + spread,
        radius: r + (Math.random() - 0.5) * 0.04,
        size: Math.random() * 1.8 + 0.3,
        color: arm === 0 ? [0, 229, 255] : arm === 1 ? [120, 80, 255] : [255, 100, 200],
        opacity: Math.random() * 0.7 + 0.15,
        speed: (Math.random() * 0.00008 + 0.00004) * (0.5 / (r + 0.1)),
      };
    });

    let angle = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Deep space bg
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      bg.addColorStop(0, 'rgba(8,4,30,0.98)');
      bg.addColorStop(0.5, 'rgba(4,2,18,0.99)');
      bg.addColorStop(1, 'rgba(2,1,8,1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const scale = Math.min(W, H) * 0.42;
      angle += 0.00018;

      // Glow core
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.18);
      core.addColorStop(0, 'rgba(180,120,255,0.55)');
      core.addColorStop(0.4, 'rgba(0,180,255,0.12)');
      core.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Galaxy particles
      particles.forEach(p => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle + angle) * p.radius * scale;
        const py = cy + Math.sin((p.angle + angle) * 0.55) * p.radius * scale * 0.38;
        const [r, g, b] = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`;
        ctx.fill();
      });

      // Twinkling stars
      const t = Date.now() * 0.001;
      stars.forEach(s => {
        s.x -= s.speed;
        if (s.x < -2) s.x = W + 2;
        const op = s.opacity * (0.6 + 0.4 * Math.sin(t * 1.5 + s.pulse));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      });

      // Outer nebula rings
      for (let i = 0; i < 3; i++) {
        const a = angle * (0.3 + i * 0.15) + (i * Math.PI * 2) / 3;
        const nx = cx + Math.cos(a) * scale * 0.6;
        const ny = cy + Math.sin(a) * scale * 0.22;
        const nebula = ctx.createRadialGradient(nx, ny, 0, nx, ny, scale * 0.25);
        const colors = ['rgba(0,180,255,0.04)', 'rgba(120,60,255,0.04)', 'rgba(255,60,160,0.04)'];
        nebula.addColorStop(0, colors[i]);
        nebula.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nebula;
        ctx.beginPath();
        ctx.arc(nx, ny, scale * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

// ── Token badge ───────────────────────────────────────────────────────────────
function TokenBadge({ token, balance }: { token: Token; balance: string }) {
  const m = TOKEN_META[token];
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
        style={{ background: m.color }}>{m.icon}</span>
      <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{token}</span>
      <span className="text-[11px] font-mono font-bold text-white">{balance}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const wallet = useWallet();
  const { balances, refresh } = useBalances(wallet.address);
  const { txHistory, clearHistory } = useSwap();
  const [tab, setTab] = useState<'swap' | 'history'>('swap');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #04021a; overflow-x: hidden; }
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .font-mono-sp { font-family: 'Space Mono', monospace; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .glass {
          background: rgba(10, 8, 40, 0.72);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-bright {
          background: rgba(15, 12, 55, 0.85);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(100,80,255,0.2);
        }
        .glow-cyan { box-shadow: 0 0 30px rgba(0,229,255,0.25), 0 0 60px rgba(0,229,255,0.08); }
        .glow-purple { box-shadow: 0 0 30px rgba(120,60,255,0.25), 0 0 60px rgba(120,60,255,0.08); }
        .text-glow { text-shadow: 0 0 20px rgba(0,229,255,0.6), 0 0 40px rgba(0,229,255,0.3); }
        .text-glow-purple { text-shadow: 0 0 20px rgba(160,100,255,0.8), 0 0 40px rgba(160,100,255,0.4); }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        @keyframes rotate-slow { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes pulse-ring { 0%{transform:scale(0.95);opacity:0.8;} 50%{transform:scale(1.05);opacity:0.4;} 100%{transform:scale(0.95);opacity:0.8;} }
        @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-ring { animation: pulse-ring 2s ease-in-out infinite; }
        .animate-fadeup { animation: fadeUp 0.4s ease forwards; }
        .btn-swap-main {
          background: linear-gradient(135deg, #00e5ff 0%, #7850ff 50%, #ff50c8 100%);
          background-size: 200% auto;
          transition: all 0.3s;
        }
        .btn-swap-main:hover { background-position: right center; box-shadow: 0 0 40px rgba(0,229,255,0.5); }
        .btn-swap-main:disabled { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); }
        .logo-ring {
          position: absolute; inset: -4px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: #00e5ff;
          border-right-color: #7850ff;
          animation: rotate-slow 3s linear infinite;
        }
        .social-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; text-decoration: none;
          font-family: 'Inter', sans-serif;
        }
        .token-field {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          transition: border-color 0.2s;
        }
        .token-field:focus-within {
          border-color: rgba(0,229,255,0.3);
          background: rgba(0,229,255,0.02);
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(100,80,255,0.4); border-radius: 2px; }
      `}</style>

      <GalaxyCanvas />

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <div className="animate-float" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 42, height: 42 }}>
              <div className="logo-ring" />
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'linear-gradient(135deg, #00e5ff, #7850ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 900, color: '#fff',
                fontFamily: 'Orbitron, sans-serif',
                boxShadow: '0 0 20px rgba(0,229,255,0.4)',
              }}>⚡</div>
            </div>
            <div>
              <div className="font-orbitron text-glow" style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>
                ARC<span style={{ color: '#00e5ff' }}>STORM</span>
              </div>
              <div className="font-mono-sp" style={{ fontSize: 9, color: 'rgba(0,229,255,0.6)', letterSpacing: 3, textTransform: 'uppercase' }}>
                Arc Testnet DEX
              </div>
            </div>
          </div>

          {/* Center links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="hidden sm:flex">
            {[
              { label: 'Explorer', href: ARC_TESTNET.explorerUrl },
              { label: 'Faucet', href: ARC_TESTNET.faucetUrl },
              { label: 'Docs', href: 'https://docs.arc.io/app-kit' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener"
                className="font-inter"
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00e5ff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Right: social + wallet */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* X (Twitter) */}
            <a href="https://x.com/arc_blockchain" target="_blank" rel="noopener"
              className="social-btn"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.728-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span className="hidden sm:inline">X</span>
            </a>

            {/* Discord */}
            <a href="https://discord.gg/buildoncircle" target="_blank" rel="noopener"
              className="social-btn"
              style={{ background: 'rgba(88,101,242,0.15)', color: 'rgba(180,180,255,0.8)', border: '1px solid rgba(88,101,242,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.3)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.15)'; e.currentTarget.style.color = 'rgba(180,180,255,0.8)'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              <span className="hidden sm:inline">Discord</span>
            </a>

            {/* Wallet */}
            {!wallet.address ? (
              <button onClick={wallet.connect} disabled={wallet.isConnecting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #00e5ff, #7850ff)',
                  border: 'none', borderRadius: 24, padding: '8px 18px',
                  color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif', letterSpacing: 0.5,
                  boxShadow: '0 0 20px rgba(0,229,255,0.3)',
                  opacity: wallet.isConnecting ? 0.7 : 1,
                }}>
                {wallet.isConnecting
                  ? <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'rotate-slow 0.7s linear infinite' }} />
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 1 0 0 4h3a1 1 0 0 0 1-1v-2.5"/></svg>
                }
                {wallet.isConnecting ? 'Connecting' : 'Connect'}
              </button>
            ) : (
              <button onClick={wallet.disconnect}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)',
                  borderRadius: 24, padding: '8px 16px',
                  color: '#00e5ff', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  fontFamily: 'Space Mono, monospace',
                }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', boxShadow: '0 0 6px #00e676', display: 'inline-block' }} />
                {wallet.shortAddress}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', paddingTop: 80, paddingBottom: 60, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>

          {/* Hero text */}
          <div style={{ textAlign: 'center', marginBottom: 32 }} className="animate-fadeup">
            <h1 className="font-orbitron text-glow-purple"
              style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 10 }}>
              Swap at the<br />
              <span style={{ background: 'linear-gradient(90deg, #00e5ff, #a060ff, #ff50c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Speed of Light
              </span>
            </h1>
            <p className="font-inter" style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>
              USDC · EURC · cirBTC on Arc Testnet
            </p>
          </div>

          {/* Balance bar */}
          {wallet.address && wallet.isArcTestnet && (
            <div className="glass animate-fadeup" style={{ borderRadius: 16, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                <TokenBadge token="USDC" balance={balances.USDC} />
                <TokenBadge token="EURC" balance={balances.EURC} />
                <TokenBadge token="cirBTC" balance={balances.cirBTC} />
              </div>
              <button onClick={refresh}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4, fontSize: 14 }}
                title="Refresh">↻</button>
              <a href={ARC_TESTNET.faucetUrl} target="_blank" rel="noopener"
                style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'rgba(0,229,255,0.6)', textDecoration: 'none', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 8, padding: '3px 8px' }}>
                Faucet ↗
              </a>
            </div>
          )}

          {/* Wrong network warning */}
          {wallet.address && !wallet.isArcTestnet && (
            <div className="animate-fadeup" style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 12, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,120,120,0.9)' }}>⚠️ Wrong network</span>
              <button onClick={wallet.switchToArc}
                style={{ background: 'rgba(255,80,80,0.2)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: 8, padding: '4px 12px', color: '#ff8080', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                Switch to Arc Testnet
              </button>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
            {(['swap', 'history'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '9px 0',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif', fontSize: 12, fontWeight: 700,
                  letterSpacing: 1, textTransform: 'uppercase',
                  transition: 'all 0.2s',
                  background: tab === t ? 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(120,80,255,0.2))' : 'transparent',
                  color: tab === t ? '#00e5ff' : 'rgba(255,255,255,0.35)',
                  boxShadow: tab === t ? '0 0 16px rgba(0,229,255,0.1)' : 'none',
                }}>
                {t === 'history' ? `History (${txHistory.length})` : t}
              </button>
            ))}
          </div>

          {/* Swap card */}
          {tab === 'swap' && (
            <div className="glass-bright animate-fadeup" style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 60px rgba(0,0,0,0.6), 0 0 40px rgba(120,80,255,0.1)' }}>
              <SwapCard wallet={wallet} balances={balances} onSwapSuccess={refresh} />
            </div>
          )}

          {/* History */}
          {tab === 'history' && (
            <div className="glass animate-fadeup" style={{ borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="font-orbitron" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>HISTORY</span>
                <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.6)', cursor: 'pointer', fontSize: 12, fontFamily: 'Space Mono' }}>Clear</button>
              </div>
              {txHistory.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🌌</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>No swaps yet</p>
                </div>
              ) : (
                <div>
                  {txHistory.map((tx, i) => (
                    <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: tx.status === 'success' ? '#00e676' : '#ff5252', boxShadow: `0 0 6px ${tx.status === 'success' ? '#00e676' : '#ff5252'}`, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontFamily: 'Space Mono', color: '#fff' }}>
                          {tx.amountIn} {tx.tokenIn} → <span style={{ color: '#00e676' }}>{tx.amountOut} {tx.tokenOut}</span>
                        </div>
                        {tx.error && <div style={{ fontSize: 10, color: 'rgba(255,80,80,0.7)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.error}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.3)' }}>
                          {Math.floor((Date.now() - tx.timestamp) / 60000)}m ago
                        </span>
                        {tx.txHash && tx.explorerUrl && (
                          <a href={tx.explorerUrl} target="_blank" rel="noopener" style={{ color: '#00e5ff', fontSize: 11 }}>↗</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 28, fontSize: 11, fontFamily: 'Space Mono', color: 'rgba(255,255,255,0.2)' }}>
            Powered by{' '}
            <a href="https://docs.arc.io" target="_blank" rel="noopener" style={{ color: 'rgba(0,229,255,0.5)', textDecoration: 'none' }}>Arc Network</a>
            {' '}·{' '}
            <a href="https://console.circle.com" target="_blank" rel="noopener" style={{ color: 'rgba(0,229,255,0.5)', textDecoration: 'none' }}>Circle App Kit</a>
          </div>
        </div>
      </main>

      <Toaster />
    </>
  );
}
