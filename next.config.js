/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages対応設定
  output: 'standalone',
  trailingSlash: true,
  
  // チャンク最適化を無効にして安定性向上
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 開発環境でのチャンク分割を最小化
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 0,
          maxAsyncRequests: 1,
          maxInitialRequests: 1,
          cacheGroups: {
            default: {
              minChunks: 1,
            },
          },
        },
      }
    }
    return config
  },
  images: {
    domains: ['localhost'],
    unoptimized: true, // 画像最適化を無効にして軽量化
  },
  // SWC最適化を無効
  swcMinify: false,
  
  // 環境変数の設定
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  // Cloudflare Pages互換性
  experimental: {
    runtime: 'nodejs',
  },
}

module.exports = nextConfig