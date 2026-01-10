import type { NextConfig } from "next";

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

// const withPWA = require("@ducanh2912/next-pwa").default({
//   dest: "public",
//   disable: process.env.NODE_ENV === "development",
//   scope: "/admin",
// });

// export default withPWA(nextConfig);
export default nextConfig;
