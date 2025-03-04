/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    nodeMiddleware: true,
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
