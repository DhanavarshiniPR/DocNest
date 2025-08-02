/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure images for better performance
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
  // Add webpack configuration for better error handling
  webpack: (config, { isServer }) => {
    // Add better error handling for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
