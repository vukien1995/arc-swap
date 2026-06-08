import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ARC Swap — Arc Testnet',
  description: 'Swap USDC, EURC, cirBTC on Arc Testnet via Circle App Kit',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
