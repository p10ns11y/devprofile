/** @type {import('next').NextConfig} */
import withVercelToolbar from "@vercel/toolbar/plugins/next";

const nextConfig = {
  images: {},
  serverExternalPackages: [
    "@react-pdf/renderer",
    "@react-pdf/render",
    "@react-pdf/layout",
    "@react-pdf/font",
    "@react-pdf/pdfkit",
    "@react-pdf/primitives",
    "@react-pdf/fns",
    "@huggingface/transformers",
    "onnxruntime-node",
  ],
  async redirects() {
    return [
      {
        source: "/content-hub",
        destination: "/x",
        permanent: false,
      },
      {
        source: "/content-hub/:path*",
        destination: "/x",
        permanent: false,
      },
      {
        source: "/focus",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/focus/:path*",
        destination: "/articles/:path*",
        permanent: true,
      },
      {
        source: "/essays",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/essays/:path*",
        destination: "/articles/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/articles",
        destination: "/focus",
      },
      {
        source: "/articles/:path*",
        destination: "/focus/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/cv.pdf",
        headers: [
          {
            key: "Cache-Control",
            value: "max-age=600, stale-while-revalidate=7200",
          },
        ],
      },
    ];
  },
};

export default withVercelToolbar()(nextConfig);
