import Link from 'next/link'
import { useT } from '@/lib/i18n'

export default function Breadcrumbs({ crumbs = [], current }) {
    const t = useT()

    return (
        <nav aria-label={t('nav.breadcrumb')} className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink-3">
                <li>
                    <Link href="/" className="hover:text-ink transition-colors">
                        {t('nav.docsRoot')}
                    </Link>
                </li>

                {crumbs.map((crumb) => (
                    <li key={crumb.slug} className="flex items-center gap-1.5">
                        <span className="text-ink-3" aria-hidden="true">/</span>
                        <Link href={`/${crumb.slug}`} className="hover:text-ink transition-colors">
                            {crumb.title}
                        </Link>
                    </li>
                ))}

                {current && (
                    <li className="flex items-center gap-1.5">
                        <span className="text-ink-3" aria-hidden="true">/</span>
                        <span aria-current="page" className="text-ink-2">
                            {current}
                        </span>
                    </li>
                )}
            </ol>
        </nav>
    )
}
