import Link from 'next/link'
import { ChevronRight, FileText, Folder } from 'lucide-react'

/**
 * Shared by the home page grid and by generated section indexes.
 *
 * 8bitjelly.com's .card: chunky outline plus a hard offset shadow. On hover the
 * card rises by exactly as much as its shadow grows (3px, 4px -> 7px), so the
 * shadow's far corner stays put and the card looks lifted off the page; on
 * click it presses down the same way.
 */
export default function DocCard({ href, title, description, isDirectory = false, cta = 'Open' }) {
    const Icon = isDirectory ? Folder : FileText

    return (
        <Link
            href={href}
            className="group flex flex-col justify-between p-5 rounded-2xl border-2 border-edge bg-surface shadow-pop
                transition-[translate,box-shadow] duration-150
                hover:shadow-pop-lg motion-safe:hover:-translate-x-[3px] motion-safe:hover:-translate-y-[3px]
                active:shadow-pop-sm motion-safe:active:translate-x-[2px] motion-safe:active:translate-y-[2px]"
        >
            <div>
                <h3 className="flex items-start gap-2 text-base font-semibold text-ink group-hover:text-accent transition-colors mb-1.5">
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink-3 group-hover:text-accent transition-colors" aria-hidden="true" />
                    <span>{title}</span>
                </h3>
                {description && (
                    <p className="text-sm text-ink-3 leading-relaxed line-clamp-2">{description}</p>
                )}
            </div>

            <div className="mt-4 pt-3 border-t-2 border-dashed border-line flex items-center justify-between text-xs font-medium text-ink-3 group-hover:text-accent transition-colors">
                <span>{cta}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </div>
        </Link>
    )
}
