import Link from 'next/link'

export default function Breadcrumbs({ crumbs = [], current }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
                <li>
                    <Link href="/" className="hover:text-slate-900 transition-colors">
                        Docs
                    </Link>
                </li>

                {crumbs.map((crumb) => (
                    <li key={crumb.slug} className="flex items-center gap-1.5">
                        <span className="text-slate-300" aria-hidden="true">/</span>
                        <Link href={`/${crumb.slug}`} className="hover:text-slate-900 transition-colors">
                            {crumb.title}
                        </Link>
                    </li>
                ))}

                {current && (
                    <li className="flex items-center gap-1.5">
                        <span className="text-slate-300" aria-hidden="true">/</span>
                        <span aria-current="page" className="text-slate-700">
                            {current}
                        </span>
                    </li>
                )}
            </ol>
        </nav>
    )
}
