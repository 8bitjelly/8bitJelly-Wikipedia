import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ACCENT_STORAGE_KEY, THEME_STORAGE_KEY } from './theme-script'

export const THEMES = ['light', 'dark', 'system']
export const ACCENTS = ['rose', 'blue', 'green']

const ThemeContext = createContext(null)
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStored(key, allowed, fallback) {
    try {
        const value = localStorage.getItem(key)
        return allowed.includes(value) ? value : fallback
    } catch {
        return fallback
    }
}

/**
 * Hand-rolled rather than next-themes, because there are two independent axes
 * here: light/dark/system AND the accent hue. next-themes injects its own
 * pre-paint script for the first one but knows nothing about the second, so
 * we would end up owning an inline script anyway - plus a dependency, a second
 * script touching <html> before paint, and two storage mechanisms.
 */
export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState('system')
    const [accent, setAccentState] = useState('rose')
    const [systemDark, setSystemDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Pick up whatever the pre-paint script already applied.
    useEffect(() => {
        setThemeState(readStored(THEME_STORAGE_KEY, THEMES, 'system'))
        setAccentState(readStored(ACCENT_STORAGE_KEY, ACCENTS, 'rose'))
        setSystemDark(window.matchMedia(DARK_QUERY).matches)
        setMounted(true)
    }, [])

    // Follow the OS while theme === 'system'.
    useEffect(() => {
        const query = window.matchMedia(DARK_QUERY)
        const onChange = (event) => setSystemDark(event.matches)
        query.addEventListener('change', onChange)
        return () => query.removeEventListener('change', onChange)
    }, [])

    // Keep other tabs in step.
    useEffect(() => {
        const onStorage = (event) => {
            if (event.key === THEME_STORAGE_KEY && THEMES.includes(event.newValue)) {
                setThemeState(event.newValue)
            }
            if (event.key === ACCENT_STORAGE_KEY && ACCENTS.includes(event.newValue)) {
                setAccentState(event.newValue)
            }
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

    useEffect(() => {
        if (!mounted) return
        document.documentElement.classList.toggle('dark', resolved === 'dark')
    }, [resolved, mounted])

    useEffect(() => {
        if (!mounted) return
        document.documentElement.setAttribute('data-accent', accent)
    }, [accent, mounted])

    const setTheme = useCallback((next) => {
        setThemeState(next)
        try {
            localStorage.setItem(THEME_STORAGE_KEY, next)
        } catch {
            /* private mode, blocked storage - the toggle still works for this page */
        }
    }, [])

    const setAccent = useCallback((next) => {
        setAccentState(next)
        try {
            localStorage.setItem(ACCENT_STORAGE_KEY, next)
        } catch {
            /* as above */
        }
    }, [])

    const value = useMemo(
        () => ({ theme, setTheme, resolved, accent, setAccent, mounted }),
        [theme, setTheme, resolved, accent, setAccent, mounted]
    )

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme must be used inside <ThemeProvider>')
    return context
}
