import { buildSearchIndex } from '@/lib/searchIndex'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/locales'

/**
 * Development only.
 *
 * `predev` generates the static index once, so without this every content edit
 * during a dev session would be searched against a stale file. In production
 * the static JSON in public/ is served instead and this route 404s.
 */
export default function handler(req, res) {
    if (process.env.NODE_ENV === 'production') {
        res.status(404).json({ error: 'Not found' })
        return
    }

    const requested = String(req.query.locale || DEFAULT_LOCALE)
    const locale = LOCALES.includes(requested) ? requested : DEFAULT_LOCALE

    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(buildSearchIndex(locale))
}
