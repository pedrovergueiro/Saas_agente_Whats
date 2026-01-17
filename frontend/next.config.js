/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'https://barberbot-backend.vercel.app'}/api/:path*`
      }
    ]
  }
}

module.exports = nextConfig