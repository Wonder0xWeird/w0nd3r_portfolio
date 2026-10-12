/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Legacy redirects below differ from their targets only by case.
  experimental: { caseSensitiveRoutes: true },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // Keep old w0nd3r.rune.love writing URLs working.
    return [
      { source: "/writing/Dear-Lambda/I-See-You", destination: "/writing/dear-lambda/i-see-you", permanent: true },
      { source: "/writing/Dear-Lambda/Infinity-Is", destination: "/writing/dear-lambda/infinity-is", permanent: true },
    ];
  },
};

export default nextConfig;
