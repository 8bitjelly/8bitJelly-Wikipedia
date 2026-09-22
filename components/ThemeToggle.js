import { Monitor, Moon, Sun } from 'lucide-react'
import HeaderMenu, { MenuOption } from './HeaderMenu'
import { useTheme } from '@/lib/theme'
import { useT } from '@/lib/i18n'

const OPTIONS = [
    { value: 'light', Icon: Sun, stringKey: 'theme.light' },
    { value: 'dark', Icon: Moon, stringKey: 'theme.dark' },
    { value: 'system', Icon: Monitor, stringKey: 'theme.system' },
]

export default function ThemeToggle() {
    const { theme, setTheme, mounted } = useTheme()
    const t = useT()
    // `theme` starts as 'system' on the server and on the first client render
    // alike, so the trigger icon cannot mismatch during hydration.
    const current = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[2]
    const CurrentIcon = current.Icon

    return (
        <HeaderMenu
            label={t('theme.group')}
            valueLabel={t(current.stringKey)}
            trigger={<CurrentIcon className="w-4 h-4" aria-hidden="true" />}
        >
            {(close) =>
                OPTIONS.map(({ value, Icon, stringKey }) => {
                    // Gated on `mounted`: the server cannot know which option is
                    // selected, so rendering it before hydration would mismatch.
                    const selected = mounted && theme === value

                    return (
                        <MenuOption
                            key={value}
                            selected={selected}
                            aria-pressed={selected}
                            onClick={() => {
                                setTheme(value)
                                close(true)
                            }}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0 text-ink-3" aria-hidden="true" />
                            {t(stringKey)}
                        </MenuOption>
                    )
                })
            }
        </HeaderMenu>
    )
}
