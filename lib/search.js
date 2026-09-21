/**
 * Query matching over a built index. Pure - safe to import from components.
 *
 * Hand-rolled rather than fuse.js / flexsearch: at ~60 documents and ~500
 * sections the ranking-quality difference is imperceptible, and either library
 * would still leave the snippet extractor and the highlighter to write.
 *
 * Everything here sits behind `search(index, query, limit)`. The index format
 * is the contract, so swapping in a fuzzy matcher later is a one-file change.
 */

const SCORE = {
    titleExact: 100,
    titlePrefix: 50,
    titleSubstring: 30,
    headline: 24,
    heading: 20,
    description: 14,
    breadcrumb: 10,
    body: 5,
}

const SNIPPET_RADIUS = 60

export function tokenize(query) {
    return String(query)
        .toLowerCase()
        .split(/[^\p{L}\p{N}_#[\]().]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length > 1)
}

function scoreField(haystack, token, weights) {
    if (!haystack) return 0
    const text = haystack.toLowerCase()
    if (text === token) return weights.exact ?? 0
    if (text.startsWith(token)) return weights.prefix ?? 0
    return text.includes(token) ? (weights.substring ?? 0) : 0
}

/** Cuts ±SNIPPET_RADIUS characters around the first hit, on word boundaries. */
function snippetAround(text, token) {
    if (!text) return ''
    const at = text.toLowerCase().indexOf(token)
    if (at === -1) return text.slice(0, SNIPPET_RADIUS * 2).trim()

    let start = Math.max(0, at - SNIPPET_RADIUS)
    let end = Math.min(text.length, at + token.length + SNIPPET_RADIUS)

    if (start > 0) {
        const space = text.indexOf(' ', start)
        if (space !== -1 && space < at) start = space + 1
    }
    if (end < text.length) {
        const space = text.lastIndexOf(' ', end)
        if (space > at + token.length) end = space
    }

    return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`
}

/**
 * Splits `text` into [{ text, match }] parts for every token. Used by the UI to
 * wrap hits in <mark> without building HTML strings.
 */
export function highlightParts(text, tokens) {
    if (!text || tokens.length === 0) return [{ text, match: false }]

    const lower = text.toLowerCase()
    const ranges = []

    for (const token of tokens) {
        let from = lower.indexOf(token)
        while (from !== -1) {
            ranges.push([from, from + token.length])
            from = lower.indexOf(token, from + token.length)
        }
    }

    if (ranges.length === 0) return [{ text, match: false }]

    ranges.sort((a, b) => a[0] - b[0])

    // Merge overlaps so nested tokens don't produce split <mark> elements.
    const merged = [ranges[0]]
    for (const [from, to] of ranges.slice(1)) {
        const last = merged[merged.length - 1]
        if (from <= last[1]) last[1] = Math.max(last[1], to)
        else merged.push([from, to])
    }

    const parts = []
    let cursor = 0
    for (const [from, to] of merged) {
        if (from > cursor) parts.push({ text: text.slice(cursor, from), match: false })
        parts.push({ text: text.slice(from, to), match: true })
        cursor = to
    }
    if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })

    return parts
}

/**
 * Every token has to match somewhere in the record (AND), which keeps
 * multi-word queries from degenerating into "anything containing 'the'".
 */
export function search(index, query, limit = 10) {
    const tokens = tokenize(query)
    if (tokens.length === 0) return { tokens, results: [] }

    const records = index?.records || []
    const results = []

    for (const record of records) {
        const breadcrumb = record.breadcrumb.join(' ')
        let total = 0
        let bestSection = null
        let bestSectionScore = 0
        let allTokensMatch = true

        for (const token of tokens) {
            let tokenScore = 0

            tokenScore += scoreField(record.title, token, {
                exact: SCORE.titleExact,
                prefix: SCORE.titlePrefix,
                substring: SCORE.titleSubstring,
            })
            tokenScore += scoreField(record.headline, token, { substring: SCORE.headline })
            tokenScore += scoreField(record.description, token, { substring: SCORE.description })
            tokenScore += scoreField(breadcrumb, token, { substring: SCORE.breadcrumb })

            for (const section of record.sections) {
                let sectionScore = 0
                sectionScore += scoreField(section.heading, token, { substring: SCORE.heading })
                sectionScore += scoreField(section.text, token, { substring: SCORE.body })

                if (sectionScore > 0) {
                    tokenScore += sectionScore
                    if (sectionScore > bestSectionScore) {
                        bestSectionScore = sectionScore
                        bestSection = section
                    }
                }
            }

            if (tokenScore === 0) {
                allTokensMatch = false
                break
            }
            total += tokenScore
        }

        if (!allTokensMatch) continue

        const primary = tokens[0]
        const snippetSource =
            bestSection?.text || record.description || record.sections[0]?.text || ''

        results.push({
            slug: record.slug,
            locale: record.locale,
            title: record.title,
            breadcrumb: record.breadcrumb,
            sectionId: bestSection?.id || null,
            sectionHeading: bestSection?.heading || '',
            snippet: snippetAround(snippetSource, primary),
            score: total,
        })
    }

    results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))

    return { tokens, results: results.slice(0, limit) }
}
