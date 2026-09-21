import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { CornerDownLeft, FileText, Search } from 'lucide-react'
import { highlightParts, search } from '@/lib/search'
import { useLocale, useT } from '@/lib/i18n'

const RESULT_LIMIT = 10

// The backdrop uses a literal colour rather than a theme token: ::backdrop lives
// in the top layer, and custom-property inheritance into it is inconsistent
// across browsers - a failed color-mix() would leave the scrim fully
// transparent. A modal scrim does not need theming anyway.
const DIALOG_CLASS =
    'w-[min(92vw,40rem)] max-h-[70vh] p-0 rounded-xl border border-line bg-surface text-ink ' +
    'shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex open:flex-col'

function Highlighted({ text, tokens }) {
    return highlightParts(text, tokens).map((part, i) =>
        part.match ? (
            <mark key={i} className="bg-accent-soft text-accent rounded-sm px-0.5">
                {part.text}
            </mark>
        ) : (
            <span key={i}>{part.text}</span>
        )
    )
}

/**
 * Full-text search over titles, headings and bodies.
 *
 * Built on the native <dialog>: showModal() gives a focus trap, Esc handling
 * and a ::backdrop for free, which is about forty lines of focus management we
 * do not have to own.
 */
const SearchDialog = forwardRef(function SearchDialog(_props, ref) {
    const dialogRef = useRef(null)
    const inputRef = useRef(null)
    const router = useRouter()
    const locale = useLocale()
    const t = useT()

    const [query, setQuery] = useState('')
    const [index, setIndex] = useState(null)
    const [status, setStatus] = useState('idle') // idle | loading | ready | error
    const [activeIndex, setActiveIndex] = useState(0)

    // The index is a few hundred KB, so it is fetched on first interaction
    // rather than shipped in every page payload.
    const loadIndex = useCallback(async () => {
        if (status === 'loading' || status === 'ready') return
        setStatus('loading')

        const url =
            process.env.NODE_ENV === 'production'
                ? `/search-index.${locale}.json`
                : `/api/search-index?locale=${locale}`

        try {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            setIndex(await response.json())
            setStatus('ready')
        } catch {
            // Someone ran `next build` without prebuild, or the file is missing.
            // Fail soft: the dialog stays usable and says so.
            setStatus('error')
        }
    }, [locale, status])

    // Refetch when the language changes.
    useEffect(() => {
        setIndex(null)
        setStatus('idle')
    }, [locale])

    const open = useCallback(() => {
        dialogRef.current?.showModal()
        loadIndex()
        requestAnimationFrame(() => inputRef.current?.select())
    }, [loadIndex])

    useImperativeHandle(ref, () => ({ open }), [open])

    const { tokens, results } = useMemo(
        () => (status === 'ready' ? search(index, query, RESULT_LIMIT) : { tokens: [], results: [] }),
        [index, query, status]
    )

    useEffect(() => setActiveIndex(0), [query])

    const go = useCallback(
        (result) => {
            dialogRef.current?.close()
            const hash = result.sectionId ? `#${result.sectionId}` : ''
            router.push(`/${result.slug}${hash}`)
        },
        [router]
    )

    // ⌘K / Ctrl+K anywhere, and `/` when not already typing.
    useEffect(() => {
        const onKeyDown = (event) => {
            const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
            const target = event.target
            const typing =
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable)

            if (isShortcut || (event.key === '/' && !typing && !dialogRef.current?.open)) {
                event.preventDefault()
                if (dialogRef.current?.open) dialogRef.current.close()
                else open()
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [open])

    const onInputKeyDown = (event) => {
        if (results.length === 0) return

        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((i) => (i + 1) % results.length)
        } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((i) => (i - 1 + results.length) % results.length)
        } else if (event.key === 'Enter') {
            event.preventDefault()
            go(results[activeIndex])
        }
    }

    return (
        <dialog
            ref={dialogRef}
            aria-label={t('search.label')}
            onClose={() => setActiveIndex(0)}
            // Clicking the backdrop reports the dialog itself as the target.
            onClick={(event) => {
                if (event.target === dialogRef.current) dialogRef.current.close()
            }}
            className={DIALOG_CLASS}
        >
            <div className="flex items-center gap-2 border-b border-line px-4">
                <Search className="w-4 h-4 flex-shrink-0 text-ink-3" aria-hidden="true" />
                <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-expanded={results.length > 0}
                    aria-controls="search-results"
                    aria-autocomplete="list"
                    // Keeps DOM focus in the input while marking the highlighted
                    // row. That is the correct combobox pattern, and it also stops
                    // DocPagination's arrow-key handler from paging the article.
                    aria-activedescendant={
                        results.length > 0 ? `search-result-${activeIndex}` : undefined
                    }
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={onInputKeyDown}
                    placeholder={t('search.placeholder')}
                    className="flex-1 bg-transparent py-3.5 text-sm text-ink placeholder-ink-3
                        focus:outline-none"
                />
                <kbd className="hidden sm:block flex-shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] font-medium text-ink-3">
                    Esc
                </kbd>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {status === 'loading' && (
                    <p className="px-3 py-6 text-center text-sm text-ink-3">{t('search.loading')}</p>
                )}

                {status === 'error' && (
                    <p className="px-3 py-6 text-center text-sm text-ink-3">{t('search.error')}</p>
                )}

                {status === 'ready' && query.trim() === '' && (
                    <p className="px-3 py-6 text-center text-sm text-ink-3">{t('search.hint')}</p>
                )}

                {status === 'ready' && query.trim() !== '' && results.length === 0 && (
                    <p className="px-3 py-6 text-center text-sm text-ink-3">
                        {t('search.empty')} <span className="font-medium text-ink-2">{query}</span>.
                    </p>
                )}

                <ul id="search-results" role="listbox" aria-label={t('search.label')}>
                    {results.map((result, i) => (
                        <li key={`${result.slug}#${result.sectionId ?? ''}`}>
                            <button
                                type="button"
                                id={`search-result-${i}`}
                                role="option"
                                aria-selected={i === activeIndex}
                                onMouseEnter={() => setActiveIndex(i)}
                                onClick={() => go(result)}
                                className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                                    i === activeIndex ? 'bg-surface-2' : ''
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <FileText
                                        className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 text-ink-3"
                                        aria-hidden="true"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="truncate text-sm font-semibold text-ink">
                                                <Highlighted text={result.title} tokens={tokens} />
                                            </span>
                                            {i === activeIndex && (
                                                <CornerDownLeft
                                                    className="ml-auto w-3 h-3 flex-shrink-0 text-ink-3"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </div>

                                        {(result.breadcrumb.length > 0 || result.sectionHeading) && (
                                            <p className="truncate text-[11px] text-ink-3">
                                                {[...result.breadcrumb, result.sectionHeading]
                                                    .filter(Boolean)
                                                    .join(' › ')}
                                            </p>
                                        )}

                                        {result.snippet && (
                                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-2">
                                                <Highlighted text={result.snippet} tokens={tokens} />
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </dialog>
    )
})

export default SearchDialog
