import Image from 'next/image'
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
 *
 * Styled after 8bitjelly.com's top nav: translucent cream, a 2px ink rule
 * underneath, and the "Wiki" label as one of the site's dark pixel-font tags.
 */
export default function SiteHeader({ tree = [], currentSlug = '' }) {
    const t = useT()

    return (
        <header className="sticky top-0 z-40 border-b-2 border-edge bg-canvas/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {tree.length > 0 && <MobileNav tree={tree} currentSlug={currentSlug} />}

                    <Link href="/" className="group flex items-center gap-2.5 min-w-0 rounded-lg">
                        <Image
                            src="/logo.webp"
                            alt="8BitJelly"
                            width={190}
                            height={120}
                            priority
                            className="h-10 w-auto flex-shrink-0 transition-transform duration-200 motion-safe:group-hover:-rotate-3"
                        />
                        <span
                            className="hidden sm:inline-block rounded-md border-2 border-edge bg-ink px-2 py-1.5
                                font-pixel text-[9px] leading-none uppercase tracking-wider text-canvas"
                        >
                            {t('site.name')}
                        </span>
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
