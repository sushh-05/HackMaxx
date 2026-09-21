/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@hackmaxx/shared"],
  output: "standalone",
  serverExternalPackages: ["@copilotkit/runtime", "@anthropic-ai/sdk"],
  turbopack: {
    resolveAlias: {
      "@copilotkit/web-inspector": "./lib/empty.js",
      "@copilotkit/web-components": "./lib/empty.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@copilotkit/web-inspector": false,
      "@copilotkit/web-components": false,
    };
    return config;
  },
};

export default nextConfig;
