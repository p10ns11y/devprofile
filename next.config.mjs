/** @type {import('next').NextConfig} */
import withVercelToolbar from '@vercel/toolbar/plugins/next';

const nextConfig = {
  images: {},
  transpilePackages: ['@react-pdf/renderer'],
  async headers() {
    return [
      {
        source: '/cv.pdf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=600, stale-while-revalidate=7200',
          },
        ],
      },
    ];
  },
}

export default withVercelToolbar()(nextConfig)
