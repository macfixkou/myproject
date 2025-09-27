/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel対応設定  
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
  // SWC最適化を有効（推奨）
  swcMinify: true,
  
  // 環境変数の設定（本番環境で上書きされる）
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  
  // TypeScript設定
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 実験的機能（必要に応じて追加）
  experimental: {
    // serverComponentsExternalPackages: ['prisma'],
  },
}

module.exports = nextConfig