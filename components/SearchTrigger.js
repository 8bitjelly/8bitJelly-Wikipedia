import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchDialog } from '@/lib/search-context'
import { useT } from '@/lib/i18n'

export default function SearchTrigger() {
    const dialog = useSearchDialog()
    const t = useT()
    const [shortcut, setShortcut] = useState('Ctrl K')

    // Rendered after mount: the server cannot know the platform, and guessing
    // would produce a hydration mismatch on the label.
    useEffect(() => {
        if (/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)) setShortcut('⌘ K')
    }, [])

    return (
        <button
            type="button"
            onClick={() => dialog?.open()}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 py-1.5 pl-2.5 pr-2
                text-sm text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2"
        >
            <Search className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{t('search.trigger')}</span>
            <kbd className="hidden sm:block rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium">
                {shortcut}
            </kbd>
        </button>
    )
}
