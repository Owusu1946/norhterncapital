import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: false,
  register: true,
  scope: '/admin',
  sw: 'sw.js',
  cacheStartUrl: false,
  dynamicStartUrl: true,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com', // Common for auth, keeping just in case
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default withPWA(nextConfig);
