import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurer les domaines d'images autorisés
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
  },
  // Configurer les origines autorisées pour le développement
  allowedDevOrigins: [
    'preview-chat-3c02b86f-c35f-4da8-8f44-ec7af9729f34.space.z.ai',
    'localhost:3000',
  ],
  // Activer le mode strict pour la production
  reactStrictMode: process.env.NODE_ENV === 'production',
  // Optimisation du webpack pour le développement
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Optimiser le watch pour le développement
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/.git/**', '**/node_modules/**'],
      };
    }
    
    // Optimiser le chunk loading
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
        // Add runtime chunk for better error handling
        runtimeChunk: {
          name: 'runtime',
        },
      };
      
      // Add chunk loading error handling
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.compilation.tap('ChunkErrorHandler', (compilation) => {
            compilation.hooks.chunkAsset.tap('ChunkErrorHandler', (chunk, filename) => {
              console.log(`Chunk generated: ${filename} for chunk ${chunk.name}`);
            });
          });
        },
      });
    }
    
    return config;
  },
  eslint: {
    // Construire en ignorant les erreurs ESLint pour le développement
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  // Configuration des expérimentations pour le chunk loading
  experimental: {
    optimizeCss: true,
    // Ajouter la gestion des erreurs de chargement de chunks
    webpackBuildWorker: true,
  },
  // Configuration pour la gestion des erreurs
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
