import Link from 'next/link'
import AccentPicker from './AccentPicker'
import LanguageSwitcher from './LanguageSwitcher'
import MobileNav from './MobileNav'
import SearchTrigger from './SearchTrigger'
import ThemeToggle from './ThemeToggle'
import { useT } from '@/lib/i18n'

/**
 * The one place global controls live. Before this existed there was no site
 * chrome at all, so there was nowhere to put a theme toggle, a language
 * switcher or a search box without adding it to both pages.
 */
export default function SiteHeader({ tree = [], currentSlug = '' }) {
    const t = useT()

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    {tree.length > 0 && <MobileNav tree={tree} currentSlug={currentSlug} />}

                    <Link
                        href="/"
                        className="truncate font-semibold text-ink hover:text-accent transition-colors"
                    >
                        8BitJelly <span className="font-normal text-ink-3">{t('site.name')}</span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <SearchTrigger />
                    <AccentPicker />
                    <ThemeToggle />
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    )
}
