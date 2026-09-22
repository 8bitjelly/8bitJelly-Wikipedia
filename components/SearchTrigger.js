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
            // The visible label is display:none below sm, which would leave an
            // icon-only button with no name.
            aria-label={t('search.trigger')}
            className="pop-control w-9 px-0 sm:w-auto sm:pl-3 sm:pr-1.5 gap-2 text-ink-2"
        >
            <Search className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{t('search.trigger')}</span>
            <kbd className="hidden sm:block rounded-full border border-line bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-medium text-ink-3">
                {shortcut}
            </kbd>
        </button>
    )
}
