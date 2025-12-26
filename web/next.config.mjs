/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // appDir is now stable in Next.js 14+
  },
};

export default nextConfig;
