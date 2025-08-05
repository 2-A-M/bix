/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  
  // Configurações de cache e headers
  async headers() {
    return [
      {
        // Cache agressivo para o arquivo JSON de transações
        source: '/transactions.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400', // 5min cache, 24h stale
          },
          {
            key: 'ETag',
            value: `"transactions-${Date.now()}"`, // ETag para validação
          },
        ],
      },
      {
        // Cache para assets estáticos
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Otimizações de build
  experimental: {
    optimizePackageImports: ['lucide-react', 'styled-components'],
  },

  // Configuração de imagens (caso seja necessário no futuro)
  images: {
    remotePatterns: [],
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig