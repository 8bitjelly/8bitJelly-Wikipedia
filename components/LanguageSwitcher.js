import Link from 'next/link'
import { useRouter } from 'next/router'
import { Languages } from 'lucide-react'
import HeaderMenu, { MenuOption } from './HeaderMenu'
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABELS, LOCALE_SHORT } from '@/lib/locales'
import { useT } from '@/lib/i18n'

/**
 * Switches locale while staying on the same article.
 *
 * `href={router.asPath}` plus the `locale` prop is the whole trick: with i18n
 * enabled asPath excludes the locale prefix, and next/link re-adds the one you
 * ask for - so the slug, query string and hash all survive. Rebuilding the URL
 * from router.pathname/query is what breaks on catch-all routes.
 */
export default function LanguageSwitcher() {
    const router = useRouter()
    const t = useT()
    const active = router.locale || DEFAULT_LOCALE

    return (
        <HeaderMenu
            label={t('lang.group')}
            valueLabel={LOCALE_LABELS[active]}
            trigger={
                <>
                    <Languages className="hidden sm:block w-4 h-4" aria-hidden="true" />
                    <span className="font-pixel text-[9px] leading-none">{LOCALE_SHORT[active]}</span>
                </>
            }
        >
            {(close) =>
                LOCALES.map((locale) => {
                    const selected = locale === active

                    return (
                        <MenuOption
                            key={locale}
                            as={Link}
                            href={router.asPath}
                            locale={locale}
                            hrefLang={locale}
                            // Endonyms, so a screen reader should voice each in its own language.
                            lang={locale}
                            aria-current={selected ? 'true' : undefined}
                            selected={selected}
                            onClick={() => close(true)}
                        >
                            <span className="w-6 flex-shrink-0 font-pixel text-[8px] text-ink-3">
                                {LOCALE_SHORT[locale]}
                            </span>
                            {LOCALE_LABELS[locale]}
                        </MenuOption>
                    )
                })
            }
        </HeaderMenu>
    )
}
