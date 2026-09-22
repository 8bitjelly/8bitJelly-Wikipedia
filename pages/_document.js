import { Html, Head, Main, NextScript } from 'next/document'
import { THEME_SCRIPT } from '@/lib/theme-script'
import { DEFAULT_LOCALE } from '@/lib/locales'

/**
 * `locale` arrives as a plain prop: DocumentProps extends HtmlProps, which Next
 * builds with the active locale and spreads into this component. No
 * getInitialProps needed.
 */
export default function Document({ locale }) {
    return (
        // suppressHydrationWarning: the pre-paint script below mutates class and
        // data-accent on <html> before React hydrates.
        <Html lang={locale || DEFAULT_LOCALE} suppressHydrationWarning>
            <Head>
                {/* First child of <Head>, ahead of every stylesheet, so the
                    correct theme is in place for the first paint. */}
                <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />

                <meta name="color-scheme" content="light dark" />

                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                {/* The 8bitjelly.com type stack. All three ship a latin-ext
                    subset, so Polish diacritics - ł included - render in-face. */}
                <link
                    href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Press+Start+2P&family=Space+Grotesk:wght@400;500;600;700&display=swap"
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
