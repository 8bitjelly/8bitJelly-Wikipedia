import HeaderMenu, { MenuOption } from './HeaderMenu'
import { ACCENTS, useTheme } from '@/lib/theme'
import { useT } from '@/lib/i18n'

/**
 * Sets data-accent on <html>. Each swatch paints itself from the same CSS
 * variable the theme uses, so a swatch can never drift from the real accent -
 * and it recolours itself in dark mode for free.
 *
 * The trigger swatch is plain `bg-accent`: it reads the live variable, which
 * the pre-paint script has already set, so it is right from the first paint
 * without waiting for `mounted`.
 */
export default function AccentPicker() {
    const { accent, setAccent, mounted } = useTheme()
    const t = useT()

    return (
        <HeaderMenu
            label={t('accent.group')}
            valueLabel={t(`accent.${accent}`)}
            trigger={
                <span className="w-4 h-4 rounded-full border-2 border-edge bg-accent" aria-hidden="true" />
            }
        >
            {(close) =>
                ACCENTS.map((name) => {
                    const selected = mounted && accent === name

                    return (
                        <MenuOption
                            key={name}
                            selected={selected}
                            aria-pressed={selected}
                            onClick={() => {
                                setAccent(name)
                                close(true)
                            }}
                        >
                            <span
                                style={{ backgroundColor: `var(--accent-${name})` }}
                                className="w-4 h-4 flex-shrink-0 rounded-full border-2 border-edge"
                                aria-hidden="true"
                            />
                            {t(`accent.${name}`)}
                        </MenuOption>
                    )
                })
            }
        </HeaderMenu>
    )
}
