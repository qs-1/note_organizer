/** @type {import('next').NextConfig} */
const nextConfig = {
  // Essential: Ensure PDF.js workers and web workers can be loaded correctly
  webpack: (config, { isServer }) => {
    // Handle worker chunks and assets properly
    config.module.rules.push({
      test: /\.(wasm|pdf\.worker\.min\.js)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[name].[hash][ext]',
      },
    });

    // Special handling for PDF.js worker 
    config.module.rules.push({
      test: /pdf\.worker\.js$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]',
      },
    });
    
    // Add fallback for node-specific modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: require.resolve('buffer/'),
      };
    }

    // Add browser polyfills and empty mocks for server-side rendering
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        'pdfjs-dist': false,
        'tesseract.js': false,
        mammoth: false,
      };
    }

    return config;
  },
  
  // Allow external image domains for OCR image processing 
  images: {
    domains: [
      'cdn.jsdelivr.net',
      'tessdata.projectnaptha.com',
      'cdnjs.cloudflare.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // External packages that should be treated as external
  serverExternalPackages: ['tesseract.js', 'pdfjs-dist', 'mammoth'],
};

module.exports = nextConfig; 