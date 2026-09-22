import '@/styles/globals.css'
import Layout from '@/components/Layout'
import TableOfContents from '@/components/TableOfContents'
import { ThemeProvider } from '@/lib/theme'

export default function MyApp({ Component, pageProps }) {
    const headings = pageProps.doc?.headings
    const toc = headings?.length > 1 ? <TableOfContents headings={headings} /> : null

    return (
        <ThemeProvider>
            <Layout tree={pageProps.tree} currentSlug={pageProps.currentSlug} toc={toc}>
                <Component {...pageProps} />
            </Layout>
        </ThemeProvider>
    )
}
