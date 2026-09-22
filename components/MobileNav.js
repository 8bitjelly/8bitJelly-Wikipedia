import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import { useT } from '@/lib/i18n'

/**
 * Below `lg` the sidebar is a drawer instead of a column that pushes the
 * article down the page.
 *
 * Same native <dialog> approach as search - focus trap, Esc and backdrop for
 * free - and the same reason for keeping the open state in the DOM: this sits
 * inside <Layout>, so React state here would re-render the article.
 */
export default function MobileNav({ tree, currentSlug }) {
    const dialogRef = useRef(null)
    const router = useRouter()
    const t = useT()

    // Close the drawer once navigation completes, otherwise it stays over the
    // article the reader just chose.
    useEffect(() => {
        const close = () => dialogRef.current?.close()
        router.events.on('routeChangeComplete', close)
        return () => router.events.off('routeChangeComplete', close)
    }, [router.events])

    return (
        <>
            <button
                type="button"
                onClick={() => dialogRef.current?.showModal()}
                aria-label={t('nav.openMenu')}
                className="pop-control lg:hidden w-9 px-0 rounded-lg"
            >
                <Menu className="w-4 h-4" aria-hidden="true" />
            </button>

            <dialog
                ref={dialogRef}
                aria-label={t('nav.documentation')}
                onClick={(event) => {
                    if (event.target === dialogRef.current) dialogRef.current.close()
                }}
                className="lg:hidden w-[min(88vw,20rem)] max-h-[85vh] mr-0 ml-0 p-0 bg-transparent
                    backdrop:bg-black/50 open:block"
            >
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => dialogRef.current?.close()}
                        aria-label={t('nav.closeMenu')}
                        className="absolute right-3 top-3 z-10 p-1.5 rounded-lg text-ink-3
                            transition-colors hover:bg-surface-2 hover:text-ink"
                    >
                        <X className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <Sidebar tree={tree} currentSlug={currentSlug} />
                </div>
            </dialog>
        </>
    )
}
