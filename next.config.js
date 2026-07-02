/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Allow the backend URL to be set via env at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  },
}

module.exports = nextConfig
