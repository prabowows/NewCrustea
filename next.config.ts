import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    allowedDevOrigins: [
        "https://*.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
