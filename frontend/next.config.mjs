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
  // Serves the API under the storefront's own origin so the session cookie stays
  // first-party. Without this the browser drops it on cross-site API calls.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return [];
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
