

const nextConfig = {
  // ========================================
  // NEXT IMAGE CONFIGURATION
  // ========================================

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },

      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
      },

      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },

      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // ========================================
  // REACT COMPILER
  // ========================================

  reactCompiler: true,

  // ========================================
  // BACKEND API PROXY
  // ========================================
  // Frontend:
  // /api/...
  //
  // will be forwarded to:
  // http://localhost:5000/api/...
  //
  // Examples:
  //
  // /api/orders
  //      ↓
  // http://localhost:5000/api/orders
  //
  // /api/courier/pathao-settings
  //      ↓
  // http://localhost:5000/api/courier/pathao-settings
  //
  // /api/fraud/check/:orderId
  //      ↓
  // http://localhost:5000/api/fraud/check/:orderId
  // ========================================

  async rewrites() {
    return [
      {
        source: "/api/:path*",

        destination:
          "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;

