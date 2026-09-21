import Link from 'next/link'
import { ChevronRight, FileText, Folder } from 'lucide-react'

/** Shared by the home page grid and by generated section indexes. */
export default function DocCard({ href, title, description, isDirectory = false, cta = 'Open' }) {
    const Icon = isDirectory ? Folder : FileText

    return (
        <Link
            href={href}
            className="group flex flex-col justify-between p-5 rounded-lg border border-line bg-surface
                hover:border-accent-line hover:shadow-sm transition-all duration-150"
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

            <div className="mt-4 pt-3 border-t border-line-soft flex items-center justify-between text-xs font-medium text-ink-3 group-hover:text-accent transition-colors">
                <span>{cta}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </div>
        </Link>
    )
}
