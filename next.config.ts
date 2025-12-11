import type {NextConfig} from 'next';

// Load environment variables from .env.local
require('dotenv').config({ path: './.env.local' });

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Explicitly set the project root for Turbopack
    turbopack: {
      rootDir: __dirname,
    },
  },
  devIndicators: {
    allowedDevOrigins: [
        "https://*.cloudworkstations.dev"
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https' ,
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'crustea.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bluelifehub.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
