import Head from 'next/head'
import Link from 'next/link'
import { useT } from '@/lib/i18n'

export default function NotFound() {
    const t = useT()

    return (
        <div className="flex items-center justify-center px-4 py-24">
            <Head>
                <title>{`${t('notFound.title')} | 8BitJelly Wiki`}</title>
            </Head>

            <div className="max-w-md w-full bg-surface rounded-xl border border-line shadow-sm p-8 text-center">
                <p className="text-xs font-semibold tracking-wider uppercase text-ink-3 mb-2">
                    {t('notFound.eyebrow')}
                </p>
                <h1 className="text-2xl font-bold text-ink mb-2">{t('notFound.title')}</h1>
                <p className="text-sm text-ink-3 mb-6">
                    {t('notFound.body')}
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
                        text-on-accent bg-accent hover:opacity-90 rounded-lg transition-colors"
                >
                    {t('notFound.back')}
                </Link>
            </div>
        </div>
    )
}
