import Link from 'next/link'
import { useRouter } from 'next/router'
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABELS, LOCALE_SHORT } from '@/lib/locales'
import { useT } from '@/lib/i18n'

/**
 * Switches locale while staying on the same article.
 *
 * `href={router.asPath}` plus the `locale` prop is the whole trick: with i18n
 * enabled asPath excludes the locale prefix, and next/link re-adds the one you
 * ask for - so the slug, query string and hash all survive. Rebuilding the URL
 * from router.pathname/query is what breaks on catch-all routes.
 */
export default function LanguageSwitcher() {
    const router = useRouter()
    const t = useT()
    const active = router.locale || DEFAULT_LOCALE

    return (
        <div
            role="group"
            aria-label={t('lang.group')}
            className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-line bg-surface-2"
        >
            {LOCALES.map((locale) => {
                const selected = locale === active

                return (
                    <Link
                        key={locale}
                        href={router.asPath}
                        locale={locale}
                        hrefLang={locale}
                        aria-current={selected ? 'true' : undefined}
                        title={LOCALE_LABELS[locale]}
                        className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                            selected
                                ? 'bg-surface text-ink shadow-sm'
                                : 'text-ink-3 hover:text-ink-2'
                        }`}
                    >
                        {LOCALE_SHORT[locale]}
                    </Link>
                )
            })}
        </div>
    )
}
