import { useEffect, useState } from 'react'

// Must match the scroll-mt-24 on headings in MarkdownRenderer.
const ACTIVE_OFFSET = 96

/**
 * `headings` comes straight from lib/docs.js, so every id here is guaranteed to
 * exist in the rendered HTML.
 *
 * `level` is relative depth, not the raw h-level: this corpus has articles that
 * are entirely h1, entirely h2 and entirely h3, so a TOC keyed to "h2 and h3"
 * would come out empty on several of them.
 */
export default function TableOfContents({ headings = [] }) {
    const [activeId, setActiveId] = useState(headings[0]?.id)

    useEffect(() => {
        if (headings.length === 0) return

        let frame = 0

        const update = () => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => {
                let current = headings[0].id

                for (const heading of headings) {
                    const element = document.getElementById(heading.id)
                    if (element && element.getBoundingClientRect().top <= ACTIVE_OFFSET) {
                        current = heading.id
                    }
                }

                // At the bottom of the page the last section is the one being
                // read, even if its heading never crosses the offset.
                const atBottom =
                    window.innerHeight + window.scrollY >=
                    document.documentElement.scrollHeight - 2
                if (atBottom) current = headings[headings.length - 1].id

                setActiveId(current)
            })
        }

        update()
        // A plain scroll listener rather than IntersectionObserver: with 212 h3s
        // many sections are shorter than the viewport, so several would be
        // intersecting at once and "which one is active" becomes order-dependent.
        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)

        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [headings])

    if (headings.length < 2) return null

    return (
        <nav aria-label="On this page" className="sticky top-20 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <h2 className="font-semibold text-ink text-xs tracking-wider uppercase mb-3">
                On this page
            </h2>

            <ul className="space-y-1 border-l border-line">
                {headings.map((heading) => {
                    const isActive = heading.id === activeId

                    return (
                        <li key={heading.id}>
                            <a
                                href={`#${heading.id}`}
                                aria-current={isActive ? 'location' : undefined}
                                style={{ paddingLeft: 12 + heading.level * 12 }}
                                className={`block py-1 pr-2 text-sm leading-snug border-l-2 -ml-px transition-colors ${
                                    isActive
                                        ? 'border-accent text-accent font-medium'
                                        : 'border-transparent text-ink-3 hover:text-ink-2'
                                }`}
                            >
                                {heading.text}
                            </a>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
