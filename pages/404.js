import Head from 'next/head'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex items-center justify-center px-4 py-24">
            <Head>
                <title>Page not found | 8BitJelly Wiki</title>
            </Head>

            <div className="max-w-md w-full bg-surface rounded-xl border border-line shadow-sm p-8 text-center">
                <p className="text-xs font-semibold tracking-wider uppercase text-ink-3 mb-2">
                    Error 404
                </p>
                <h1 className="text-2xl font-bold text-ink mb-2">Page not found</h1>
                <p className="text-sm text-ink-3 mb-6">
                    The document you are looking for does not exist or has moved.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
                        text-on-accent bg-accent hover:opacity-90 rounded-lg transition-colors"
                >
                    Back to documentation
                </Link>
            </div>
        </div>
    )
}
