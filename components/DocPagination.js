import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function DocPagination({ prev, next }) {
    const router = useRouter()

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return

            const target = event.target
            const isTyping =
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable)
            if (isTyping) return

            // Don't navigate the page out from under an open modal.
            if (document.querySelector('dialog[open]')) return

            if (event.key === 'ArrowLeft' && prev) router.push(`/${prev.slug}`)
            if (event.key === 'ArrowRight' && next) router.push(`/${next.slug}`)
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [prev, next, router])

    if (!prev && !next) return null

    const cardClass =
        'flex-1 max-w-[280px] p-4 rounded-xl border border-slate-200 bg-white shadow-sm ' +
        'hover:border-slate-300 transition-all group'

    return (
        <nav aria-label="Article navigation" className="mt-6 flex items-stretch justify-between gap-4">
            {prev ? (
                <Link href={`/${prev.slug}`} className={`${cardClass} text-left`} rel="prev">
                    <span className="block text-xs font-medium text-slate-400 group-hover:text-slate-600 mb-1">
                        &larr; Previous
                    </span>
                    <span className="block text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                        {prev.title}
                    </span>
                </Link>
            ) : (
                <div aria-hidden="true" />
            )}

            {next && (
                <Link href={`/${next.slug}`} className={`${cardClass} text-right`} rel="next">
                    <span className="block text-xs font-medium text-slate-400 group-hover:text-slate-600 mb-1">
                        Next &rarr;
                    </span>
                    <span className="block text-sm font-semibold text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                        {next.title}
                    </span>
                </Link>
            )}
        </nav>
    )
}
