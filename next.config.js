/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
  // Required for Circle App Kit
  transpilePackages: ['@circle-fin/app-kit', '@circle-fin/adapter-viem-v2'],
};

module.exports = nextConfig;
