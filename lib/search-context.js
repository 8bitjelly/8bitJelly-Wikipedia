import { createContext, useContext } from 'react'

/**
 * Carries a stable imperative handle ({ open }) rather than open/closed state.
 *
 * That is deliberate: the provider lives in <Layout>, which renders the
 * article, and ReactMarkdown re-parses the whole document on every render. A
 * boolean `isOpen` up there would re-parse the article every time the dialog
 * opened. The native <dialog> keeps that state in the DOM instead.
 */
export const SearchContext = createContext(null)

export function useSearchDialog() {
    return useContext(SearchContext)
}
