/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        scrollRestoration: true,
    },
    // A dev server and a production build share .next/ by default, and building
    // while `npm run dev` is running deletes the chunks the other one needs.
    // Set WIKI_DIST_DIR to give a second Next process its own build directory.
    ...(process.env.WIKI_DIST_DIR ? { distDir: process.env.WIKI_DIST_DIR } : {}),
}

export default nextConfig
