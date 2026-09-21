import Link from 'next/link'

export default function Breadcrumbs({ crumbs = [], current }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink-3">
                <li>
                    <Link href="/" className="hover:text-ink transition-colors">
                        Docs
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
