import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useT } from '@/lib/i18n'

export default function DocPagination({ prev, next }) {
    const router = useRouter()
    const t = useT()

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
        'flex-1 max-w-[280px] p-4 rounded-xl border border-line bg-surface shadow-sm ' +
        'hover:border-line-strong transition-all group'

    return (
        <nav aria-label={t('nav.articleNav')} className="mt-6 flex items-stretch justify-between gap-4">
            {prev ? (
                <Link href={`/${prev.slug}`} className={`${cardClass} text-left`} rel="prev">
                    <span className="block text-xs font-medium text-ink-3 group-hover:text-ink-2 mb-1">
                        &larr; {t('nav.previous')}
                    </span>
                    <span className="block text-sm font-semibold text-ink group-hover:text-accent transition-colors truncate">
                        {prev.title}
                    </span>
                </Link>
            ) : (
                <div aria-hidden="true" />
            )}

            {next && (
                <Link href={`/${next.slug}`} className={`${cardClass} text-right`} rel="next">
                    <span className="block text-xs font-medium text-ink-3 group-hover:text-ink-2 mb-1">
                        {t('nav.next')} &rarr;
                    </span>
                    <span className="block text-sm font-semibold text-ink group-hover:text-accent transition-colors truncate">
                        {next.title}
                    </span>
                </Link>
            )}
        </nav>
    )
}
