import { Languages } from 'lucide-react'
import { useT } from '@/lib/i18n'

/**
 * Shown when the requested locale has no version of this article and a fallback
 * is being served. The alternative - hiding untranslated articles - would turn
 * the Polish side of a 60-article wiki into a handful of stubs.
 */
export default function TranslationNotice({ requestedLocale, servedLocale }) {
    const t = useT()

    if (!servedLocale || servedLocale === requestedLocale) return null

    return (
        <div
            role="note"
            className="mb-6 flex items-start gap-3 rounded-lg border border-accent-line bg-accent-soft p-4"
        >
            <Languages className="mt-0.5 w-4 h-4 flex-shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{t('translation.missingTitle')}</p>
                <p className="text-sm text-ink-2">
                    {t('translation.missingBody', {
                        requested: t(`locale.${requestedLocale}`),
                        served: t(`locale.${servedLocale}`),
                    })}
                </p>
            </div>
        </div>
    )
}
