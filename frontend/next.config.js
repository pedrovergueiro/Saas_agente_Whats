/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'https://barberbot-backend.fly.dev';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ]
  }
}

module.exports = nextConfig