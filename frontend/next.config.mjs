/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // "standalone" output is only for the self-hosted Docker build (see Dockerfile).
  // Netlify's Next.js Runtime needs the default build output to route requests correctly.
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" } : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.velara.com" },
    ],
  },
};

export default nextConfig;
