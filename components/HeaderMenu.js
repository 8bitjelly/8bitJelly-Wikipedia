import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

/**
 * A disclosure dropdown for the header's theme, accent and language pickers.
 *
 * Deliberately not an ARIA `role="menu"`: that role promises a full
 * roving-focus keyboard model. A disclosure - a button that shows a panel of
 * ordinary buttons and links - is honest about what it is, and Tab, Esc and
 * the arrow keys all work on top of it.
 *
 * The open flag is React state, but it lives HERE, in a leaf. Opening a menu
 * re-renders this component only - not SiteHeader, and not Layout, whose
 * re-render would make ReactMarkdown re-parse the article.
 */
export default function HeaderMenu({ label, valueLabel, trigger, children }) {
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef(null)
    const triggerRef = useRef(null)
    const panelId = useId()
    const headingId = useId()

    const close = useCallback((restoreFocus = false) => {
        setOpen(false)
        if (restoreFocus) triggerRef.current?.focus()
    }, [])

    // Listeners go on the document rather than the wrapper, and only while open.
    // Safari does not focus a button on click, so after a mouse-open focus may
    // not be inside the wrapper at all - a wrapper onKeyDown would miss Esc.
    // Closing on `focusin` elsewhere rather than on the wrapper's blur: in that
    // same Safari case a blur fires on mousedown, before the option's click,
    // and unmounting the panel there would swallow the click.
    useEffect(() => {
        if (!open) return

        const isOutside = (node) => !wrapperRef.current?.contains(node)
        const onPointerDown = (event) => {
            if (isOutside(event.target)) setOpen(false)
        }
        const onFocusIn = (event) => {
            if (isOutside(event.target)) setOpen(false)
        }
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                close(true)
            }
        }

        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('focusin', onFocusIn)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('focusin', onFocusIn)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open, close])

    // Arrow keys step through the options, wrapping at either end.
    const onKeyDown = (event) => {
        if (!open || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return

        const options = [...wrapperRef.current.querySelectorAll('[data-menu-option]')]
        if (options.length === 0) return
        event.preventDefault()

        const step = event.key === 'ArrowDown' ? 1 : -1
        const current = options.indexOf(document.activeElement)
        const next =
            current === -1
                ? step === 1 ? 0 : options.length - 1
                : (current + step + options.length) % options.length
        options[next].focus()
    }

    return (
        <div ref={wrapperRef} className="relative" onKeyDown={onKeyDown}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                aria-label={valueLabel ? `${label}: ${valueLabel}` : label}
                title={label}
                // A 36px square below sm, so four controls plus the logo still
                // fit a 320px screen; the chevron joins it from sm up.
                className="pop-control w-9 px-0 sm:w-auto sm:px-2.5"
            >
                {trigger}
                <ChevronDown
                    className={`hidden sm:block w-3.5 h-3.5 text-ink-3 transition-transform duration-150 ${
                        open ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                />
            </button>

            {/* Rendered only while open, so closed options are out of the tab
                order and the accessibility tree. `w-max` because an absolute box
                otherwise shrinks to its 36px-wide wrapper and wraps every word. */}
            {open && (
                <div
                    id={panelId}
                    className="absolute right-0 top-full z-50 mt-2.5 w-max min-w-44 max-w-[min(18rem,calc(100vw-2rem))]
                        rounded-2xl border-2 border-edge bg-surface p-1.5 shadow-pop"
                >
                    <p
                        id={headingId}
                        className="px-3 pt-2 pb-2.5 font-pixel text-[8px] leading-relaxed uppercase tracking-widest text-ink-3"
                    >
                        {label}
                    </p>
                    <ul aria-labelledby={headingId} className="space-y-0.5">
                        {children(close)}
                    </ul>
                </div>
            )}
        </div>
    )
}

/**
 * One row in a HeaderMenu panel. Renders a <button> by default; pass
 * `as={Link}` for navigation. The check mark is always rendered and merely
 * hidden when unselected, so rows keep the same width either way.
 */
export function MenuOption({ as: Tag = 'button', selected = false, children, ...rest }) {
    return (
        <li>
            <Tag
                {...(Tag === 'button' ? { type: 'button' } : null)}
                {...rest}
                data-menu-option=""
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors
                    hover:bg-accent-soft hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 ${
                        selected ? 'bg-accent-soft font-semibold text-ink' : 'text-ink-2'
                    }`}
            >
                {children}
                <Check
                    className={`ml-auto w-4 h-4 flex-shrink-0 text-accent ${selected ? '' : 'invisible'}`}
                    aria-hidden="true"
                />
            </Tag>
        </li>
    )
}
