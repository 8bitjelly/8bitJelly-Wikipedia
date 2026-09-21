import Link from 'next/link'
import AccentPicker from './AccentPicker'
import ThemeToggle from './ThemeToggle'

/**
 * The one place global controls live. Before this existed there was no site
 * chrome at all, so there was nowhere to put a theme toggle without adding it
 * to both pages.
 */
export default function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
                <Link href="/" className="font-semibold text-ink hover:text-accent transition-colors">
                    8BitJelly <span className="font-normal text-ink-3">Wiki</span>
                </Link>

                <div className="flex items-center gap-3">
                    <AccentPicker />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
