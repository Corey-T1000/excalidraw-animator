/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false
      }
    });

    config.module.rules.push({
      test: /node_modules\/@excalidraw\/excalidraw/,
      use: [
        {
          loader: 'source-map-loader',
          options: {
            filterSourceMappingUrl: (url, resourcePath) => {
              return false;
            },
          },
        },
      ],
    });

    return config;
  },
}

module.exports = nextConfig