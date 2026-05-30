import { withBotId } from "botid/next/config";

const nextConfig = {
  images: {
    remotePatterns: [],
  },
  experimental: {
    proxyClientMaxBodySize: 50 * 1024 * 1024,
  },
};

export default withBotId(nextConfig);
