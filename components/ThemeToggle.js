import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'

const OPTIONS = [
    { value: 'light', Icon: Sun, label: 'Light theme' },
    { value: 'dark', Icon: Moon, label: 'Dark theme' },
    { value: 'system', Icon: Monitor, label: 'Match system' },
]

export default function ThemeToggle() {
    const { theme, setTheme, mounted } = useTheme()

    return (
        <div
            role="group"
            aria-label="Colour theme"
            className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-line bg-surface-2"
        >
            {OPTIONS.map(({ value, Icon, label }) => {
                // Gated on `mounted`: the server cannot know which option is
                // selected, so rendering it before hydration would mismatch.
                const selected = mounted && theme === value

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setTheme(value)}
                        aria-label={label}
                        aria-pressed={selected}
                        title={label}
                        className={`p-1.5 rounded-md transition-colors ${
                            selected
                                ? 'bg-surface text-ink shadow-sm'
                                : 'text-ink-3 hover:text-ink-2'
                        }`}
                    >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                    </button>
                )
            })}
        </div>
    )
}
