/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
