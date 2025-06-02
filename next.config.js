/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  distDir: process.env.NODE_ENV === 'production' ? 'out' : '.next',
  images: {
    unoptimized: true
  },
  assetPrefix: '',
  basePath: '',
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig 