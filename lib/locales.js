/**
 * Locale constants, in their own module with no Node imports so that client
 * components can use them. lib/docs.js reads the filesystem and must never be
 * pulled into the browser bundle.
 *
 * Adding a language is this array plus a content/<locale>/ folder plus a block
 * in lib/i18n.js.
 */
export const LOCALES = ['en', 'pl']
export const DEFAULT_LOCALE = 'en'

export const LOCALE_LABELS = {
    en: 'English',
    pl: 'Polski',
}

/** Short label for badges and the switcher. */
export const LOCALE_SHORT = {
    en: 'EN',
    pl: 'PL',
}
