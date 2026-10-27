const { basePath, outDir } = require("./site.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath,

  // Performance settings
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Make sure prompt files end up in the export output
  webpack: (config) => {
    const CopyPlugin = require("copy-webpack-plugin");

    config.optimization = {
      ...config.optimization,
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace("@", "")}`;
            },
          },
        },
      },
    };

    const prefix = outDir ? `${outDir}/` : "";
    const patterns = [{ from: "prompts", to: `${prefix}prompts` }];

    // When served from a sub-path, mirror the public data under it as well.
    if (prefix) {
      patterns.push(
        { from: "public/data", to: `${prefix}data` },
        { from: "public/locales", to: `${prefix}locales` }
      );
    }

    config.plugins.push(new CopyPlugin({ patterns }));
    return config;
  },
};

module.exports = nextConfig;
