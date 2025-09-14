/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {},
  transpilePackages: ['@react-pdf/renderer'],
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig
