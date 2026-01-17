/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuração para Vercel - backend e frontend juntos
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*' // API routes do próprio Next.js
      }
    ]
  }
}

module.exports = nextConfig