/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,         // gzip/brotli compression for static assets
  poweredByHeader: false, // removes X-Powered-By header
  images: {
    remotePatterns: [
      // Cloudinary — product and review images
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Google Charts — UPI QR codes generated at checkout
      {
        protocol: 'https',
        hostname: 'chart.googleapis.com',
        pathname: '/**',
      },
    ],
  },
  // Explicit turbopack config satisfies Next.js 16 when no custom webpack is needed
  turbopack: {},
}

export default nextConfig
