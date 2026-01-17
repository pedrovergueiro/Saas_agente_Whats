/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://barberbot-backend-gd6zone7o-pedrovergueiros-projects-02d02ff2.vercel.app/api'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://barberbot-backend-gd6zone7o-pedrovergueiros-projects-02d02ff2.vercel.app/api'}/:path*`
      }
    ]
  }
}

module.exports = nextConfig