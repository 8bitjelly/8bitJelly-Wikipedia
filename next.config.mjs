/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        scrollRestoration: true,
    },
    i18n: {
        locales: ['en', 'pl'],
        defaultLocale: 'en',
        // Deliberately off. With detection on, a Polish-locale browser hitting /
        // is redirected to /pl, where most articles fall back to English wrapped
        // in a "not translated" banner - confusing. The URL is the only source
        // of truth; the header carries an explicit switcher.
        localeDetection: false,
    },
    // A dev server and a production build share .next/ by default, and building
    // while `npm run dev` is running deletes the chunks the other one needs.
    // Set WIKI_DIST_DIR to give a second Next process its own build directory.
    ...(process.env.WIKI_DIST_DIR ? { distDir: process.env.WIKI_DIST_DIR } : {}),
}

export default nextConfig
