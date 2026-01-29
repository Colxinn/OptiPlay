/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: [] },
  typescript: { tsconfigPath: './jsconfig.json' },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Disable static export for now due to auth/database requirements
  output: 'standalone',
  skipTrailingSlashRedirect: true,
  skipMiddlewareSourceMapRemoval: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

