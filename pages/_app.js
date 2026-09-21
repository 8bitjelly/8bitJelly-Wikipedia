import '@/styles/globals.css'
import 'github-markdown-css/github-markdown-light.css'
import Layout from '@/components/Layout'

export default function MyApp({ Component, pageProps }) {
    return (
        <Layout tree={pageProps.tree} currentSlug={pageProps.currentSlug}>
            <Component {...pageProps} />
        </Layout>
    )
}
