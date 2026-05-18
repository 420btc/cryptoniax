/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  transpilePackages: ['pixi.js'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // MetaMask SDK pulls React Native deps — not needed for web
      '@react-native-async-storage/async-storage': false,
      // WalletConnect logger pulls pino-pretty — not needed in browser
      'pino-pretty': false,
      // Additional React Native stubs
      'react-native': false,
    };
    return config;
  },
};
module.exports = nextConfig;
