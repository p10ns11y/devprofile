/** @type {import('next').NextConfig} */
import withVercelToolbar from '@vercel/toolbar/plugins/next';

const nextConfig = {
  images: {},
  transpilePackages: ['@react-pdf/renderer'],
}

export default withVercelToolbar()(nextConfig)
