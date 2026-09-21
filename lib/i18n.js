import { useRouter } from 'next/router'
import { DEFAULT_LOCALE } from './locales.js'

/**
 * A plain dictionary rather than next-i18next / next-intl.
 *
 * Those want a config file, an appWithTranslation HOC, serverSideTranslations()
 * in every getStaticProps and a public/locales tree - five files of ceremony to
 * deliver ~45 strings with no pluralisation, no ICU and no date formatting.
 * They start earning their keep at hundreds of strings and several translators.
 */
const STRINGS = {
    en: {
        'site.name': 'Wiki',
        'nav.skipToContent': 'Skip to content',
        'nav.documentation': 'Documentation',
        'nav.breadcrumb': 'Breadcrumb',
        'nav.docsRoot': 'Docs',
        'nav.articleNav': 'Article navigation',
        'nav.previous': 'Previous',
        'nav.openMenu': 'Open navigation',
        'nav.closeMenu': 'Close navigation',
        'nav.collapse': 'Collapse {title}',
        'nav.expand': 'Expand {title}',
        'nav.next': 'Next',


        'search.trigger': 'Search',
        'search.label': 'Search all content',
        'search.placeholder': 'Search articles, headings and code...',
        'search.hint': 'Start typing to search every article.',
        'search.empty': 'No results for',
        'search.loading': 'Loading search index...',
        'search.error': 'Search index unavailable. Run npm run build to generate it.',

        'filter.placeholder': 'Filter articles...',
        'filter.label': 'Filter articles by title',
        'filter.clear': 'Clear filter',
        'filter.empty': 'Nothing matches',

        'toc.title': 'On this page',
        'toc.permalink': 'Permalink to this section',

        'section.inThisSection': 'In this section',
        'section.browse': 'Browse section',
        'section.read': 'Read article',
        'section.explore': 'Explore category',

        'home.title': 'Welcome to our Wiki',
        'home.subtitle':
            'Explore our project guides, architecture overviews, and team coding standards.',
        'home.gettingStarted': 'Getting Started',
        'home.meta': 'Project guides, architecture overviews and team coding standards.',

        'diagram.loading': 'Rendering diagram...',
        'diagram.label': 'Diagram',
        'diagram.errorTitle': 'Diagram could not be rendered.',
        'diagram.errorBody': 'Its source is shown below.',

        'code.copy': 'Copy code',
        'code.copied': 'Copied',

        'theme.group': 'Colour theme',
        'theme.light': 'Light theme',
        'theme.dark': 'Dark theme',
        'theme.system': 'Match system',
        'accent.group': 'Accent colour',

        'lang.group': 'Language',
        // Language names as prose, in THIS interface language. The endonyms in
        // lib/locales.js are right for the switcher and wrong in a sentence.
        'locale.en': 'English',
        'locale.pl': 'Polish',

        'translation.missingTitle': 'Not translated yet',
        'translation.missingBody':
            'This article has no {requested} version, so the {served} one is shown.',
        'translation.badge': 'Available in {locale} only',

        'notFound.eyebrow': 'Error 404',
        'notFound.title': 'Page not found',
        'notFound.body': 'The document you are looking for does not exist or has moved.',
        'notFound.back': 'Back to documentation',
    },

    pl: {
        'site.name': 'Wiki',
        'nav.skipToContent': 'Przejdź do treści',
        'nav.documentation': 'Dokumentacja',
        'nav.breadcrumb': 'Ścieżka nawigacji',
        'nav.docsRoot': 'Dokumentacja',
        'nav.articleNav': 'Nawigacja po artykułach',
        'nav.previous': 'Poprzedni',
        'nav.openMenu': 'Otwórz nawigację',
        'nav.closeMenu': 'Zamknij nawigację',
        'nav.collapse': 'Zwiń {title}',
        'nav.expand': 'Rozwiń {title}',
        'nav.next': 'Następny',


        'search.trigger': 'Szukaj',
        'search.label': 'Szukaj w całej treści',
        'search.placeholder': 'Szukaj w artykułach, nagłówkach i kodzie...',
        'search.hint': 'Zacznij pisać, aby przeszukać wszystkie artykuły.',
        'search.empty': 'Brak wyników dla',
        'search.loading': 'Ładowanie indeksu...',
        'search.error': 'Indeks wyszukiwania niedostępny. Uruchom npm run build, aby go wygenerować.',

        'filter.placeholder': 'Filtruj artykuły...',
        'filter.label': 'Filtruj artykuły po tytule',
        'filter.clear': 'Wyczyść filtr',
        'filter.empty': 'Brak wyników dla',

        'toc.title': 'Na tej stronie',
        'toc.permalink': 'Odnośnik do tej sekcji',

        'section.inThisSection': 'W tej sekcji',
        'section.browse': 'Przejdź do sekcji',
        'section.read': 'Czytaj artykuł',
        'section.explore': 'Zobacz kategorię',

        'home.title': 'Witaj w naszej Wiki',
        'home.subtitle':
            'Przewodniki projektowe, przegląd architektury i standardy kodowania zespołu.',
        'home.gettingStarted': 'Na początek',
        'home.meta': 'Przewodniki projektowe, przegląd architektury i standardy kodowania.',

        'diagram.loading': 'Rysowanie diagramu...',
        'diagram.label': 'Diagram',
        'diagram.errorTitle': 'Nie udało się wyrenderować diagramu.',
        'diagram.errorBody': 'Poniżej jego źródło.',

        'code.copy': 'Kopiuj kod',
        'code.copied': 'Skopiowano',

        'theme.group': 'Motyw kolorystyczny',
        'theme.light': 'Motyw jasny',
        'theme.dark': 'Motyw ciemny',
        'theme.system': 'Zgodnie z systemem',
        'accent.group': 'Kolor akcentu',

        'lang.group': 'Język',
        // Dopełniacz, bo wstawiane po "wersji".
        'locale.en': 'angielskiej',
        'locale.pl': 'polskiej',

        'translation.missingTitle': 'Brak tłumaczenia',
        // Both slots sit after "w wersji", so one inflected form fits each.
        'translation.missingBody':
            'Tego artykułu nie ma w wersji {requested} — pokazujemy go w wersji {served}.',
        'translation.badge': 'Dostępne tylko w wersji {locale}',

        'notFound.eyebrow': 'Błąd 404',
        'notFound.title': 'Nie znaleziono strony',
        'notFound.body': 'Szukany dokument nie istnieje albo został przeniesiony.',
        'notFound.back': 'Wróć do dokumentacji',
    },
}

function interpolate(template, values) {
    if (!values) return template
    return template.replace(/\{(\w+)\}/g, (match, key) =>
        key in values ? String(values[key]) : match
    )
}

export function translate(locale, key, values) {
    const template = STRINGS[locale]?.[key] ?? STRINGS[DEFAULT_LOCALE][key] ?? key
    return interpolate(template, values)
}

/** t('toc.title') inside any component. */
export function useT() {
    const { locale } = useRouter()
    const active = locale || DEFAULT_LOCALE
    return (key, values) => translate(active, key, values)
}

/** The active locale, safe to call outside a router context. */
export function useLocale() {
    const { locale } = useRouter()
    return locale || DEFAULT_LOCALE
}
