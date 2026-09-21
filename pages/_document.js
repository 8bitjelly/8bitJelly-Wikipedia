import { Html, Head, Main, NextScript } from 'next/document'
import { THEME_SCRIPT } from '@/lib/theme-script'

export default function Document() {
    return (
        // suppressHydrationWarning: the pre-paint script below mutates class and
        // data-accent on <html> before React hydrates.
        <Html lang="en" suppressHydrationWarning>
            <Head>
                {/* First child of <Head>, ahead of every stylesheet, so the
                    correct theme is in place for the first paint. */}
                <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />

                <meta name="color-scheme" content="light dark" />

                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
