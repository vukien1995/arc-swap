import { TOKEN_META } from '@/lib/constants';
import type { Token } from '@/types';

interface Props {
  token: Token;
  size?: number;
  className?: string;
}

export function TokenIcon({ token, size = 28, className = '' }: Props) {
  const meta = TOKEN_META[token];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white flex-shrink-0 ${className}`}
      style={{
        width: size, height: size,
        fontSize: size * 0.45,
        background: meta.color,
        boxShadow: `0 0 ${size / 2}px ${meta.color}40`,
      }}
    >
      {meta.icon}
    </span>
  );
}
