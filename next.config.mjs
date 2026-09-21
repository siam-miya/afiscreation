
const nextConfig = {

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
  reactCompiler: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",

        destination:
          `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

