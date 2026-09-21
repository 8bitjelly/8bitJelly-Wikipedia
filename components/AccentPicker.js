import { ACCENTS, useTheme } from '@/lib/theme'
import { useT } from '@/lib/i18n'

const LABELS = { rose: 'Rose', blue: 'Blue', green: 'Green' }

/**
 * Sets data-accent on <html>. Each swatch paints itself from the same CSS
 * variable the theme uses, so a swatch can never drift from the real accent -
 * and it recolours itself in dark mode for free.
 */
export default function AccentPicker() {
    const { accent, setAccent, mounted } = useTheme()
    const t = useT()

    return (
        <div role="group" aria-label={t('accent.group')} className="hidden sm:inline-flex items-center gap-1.5">
            {ACCENTS.map((name) => {
                const selected = mounted && accent === name

                return (
                    <button
                        key={name}
                        type="button"
                        onClick={() => setAccent(name)}
                        aria-label={`${LABELS[name]} accent`}
                        aria-pressed={selected}
                        title={`${LABELS[name]} accent`}
                        style={{ backgroundColor: `var(--accent-${name})` }}
                        className={`w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-all ${
                            selected ? 'ring-ink scale-110' : 'ring-transparent hover:scale-110'
                        }`}
                    />
                )
            })}
        </div>
    )
}
