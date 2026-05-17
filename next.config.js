/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  transpilePackages: ['pixi.js'],
};
module.exports = nextConfig;
