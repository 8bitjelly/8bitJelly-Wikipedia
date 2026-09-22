/**
 * The only two sluggers in this repo.
 *
 *  - `slugifySegment` turns a human file/folder name into a URL path segment.
 *  - `headingSlug`    turns heading text into an anchor id.
 *
 * Both are shared by the server (lib/docs.js, scripts/*) so that anchors and
 * paths can never drift between what the build emits and what the UI links to.
 */

// `ł` and `Ł` have NO NFKD decomposition, so the usual
// normalize('NFD') + strip-combining-marks trick silently leaves them behind,
// after which the [^a-z0-9] pass eats them and "słownik" becomes "sownik".
// Hence an explicit map. Do not remove it.
const TRANSLITERATE = {
    ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
    Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z',
}

export function transliterate(input) {
    return String(input).replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (c) => TRANSLITERATE[c] || c)
}

function stripDiacritics(input) {
    return transliterate(input).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * "Formatting & Style"   -> "formatting-and-style"
 * "Destroy().md"         -> "destroy"
 * "Overusing Debug.Log"  -> "overusing-debug-log"
 * "DOKUMENTACJA AUDIO"   -> "dokumentacja-audio"
 */
export function slugifySegment(name) {
    const base = String(name).replace(/\.md$/i, '')
    const slug = stripDiacritics(base)
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    return slug || 'untitled'
}

/**
 * GitHub-flavoured heading anchor. Pass a shared `seen` Map across one
 * document so repeated headings get -2, -3, ... suffixes.
 */
export function headingSlug(text, seen) {
    const base = stripDiacritics(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || 'section'

    if (!seen) return base

    const count = seen.get(base) || 0
    seen.set(base, count + 1)

    return count === 0 ? base : `${base}-${count + 1}`
}
