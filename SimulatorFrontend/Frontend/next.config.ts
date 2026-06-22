// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cobuild-simulator-backend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'webapp3buckets3.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
