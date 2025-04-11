const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["redis"], // Add redis to the list of packages that should only be bundled on the server
  },
  webpack: (config, { isServer }) => {
    // If we're building for the client, replace server-only modules with empty objects
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        "server-only": false,
      };
    }
    return config;
  },
};

export default nextConfig;
