/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: [] },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};
