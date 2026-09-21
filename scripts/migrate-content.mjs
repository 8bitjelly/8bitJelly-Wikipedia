/**
 * One-shot content migration: flat `content/` -> `content/<locale>/` with
 * kebab-case slugs, normalised frontmatter and rewritten internal links.
 *
 *   node scripts/migrate-content.mjs            # dry run, prints the plan
 *   node scripts/migrate-content.mjs --apply    # performs it
 *
 * Kept in the repo because it is the only record of the old -> new mapping.
 *
 * Three things it deliberately does NOT do:
 *   - re-serialize markdown bodies (that reflows tables, swaps emphasis
 *     markers and renumbers lists). Links are patched textually by AST offset.
 *   - change line endings. Each file keeps the EOL it already had.
 *   - use `git mv`. This repo's index contains case-duplicate directories
 *     (`content/Tutorials/...` AND `content/tutorials/...` both exist in HEAD,
 *     while Windows has only one of them on disk), so `git mv` refuses paths it
 *     considers untracked. Plain renames plus `git add -A` let git's own rename
 *     detection sort it out, which also repairs the case split.
 *
 * It is idempotent: files already at their destination are left alone, so a
 * partially-completed run can simply be re-run.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import matter from 'gray-matter'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { visit } from 'unist-util-visit'
import { toString as nodeToString } from 'mdast-util-to-string'
import { slugifySegment } from '../lib/slug.js'

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content')
const APPLY = process.argv.includes('--apply')
const DEFAULT_LOCALE = 'en'
const LOCALES = ['en', 'pl']

/** Judgement calls the slugifier cannot make on its own. */
const SLUG_OVERRIDES = new Map([
    // filename carries a typo; the frontmatter title spells it correctly
    ['method seperation and decomposition', 'method-separation-and-decomposition'],
    // CamelCase names that read badly as one word
    ['levelsetup', 'level-setup'],
    ['systemarchitecture', 'system-architecture'],
    ['basebutton', 'base-button'],
    ['addlistener', 'add-listener'],
    ['scriptableobjects', 'scriptable-objects'],
])

/** Articles written in Polish. Explicit beats a language detector. */
const POLISH = new Set(
    [
        'Tutorials/FMOD/DOKUMENTACJA AUDIO.md',
        'Tutorials/Getting Started/Clone.md',
        'Projects/AstroGame/Tasks/Sprint 1/BaseButton.md',
        'Projects/AstroGame/Tasks/Sprint 1/Core MVP.md',
        'Projects/AstroGame/Tasks/Sprint 1/SystemArchitecture.md',
    ].map((p) => p.toLowerCase())
)

const LOCAL_ORIGIN = /^https?:\/\/localhost(:\d+)?/i

/* ------------------------------------------------------------------ */

function slugFor(segment) {
    return SLUG_OVERRIDES.get(segment.toLowerCase()) || slugifySegment(segment)
}

function toPosix(p) {
    return p.split(path.sep).join('/')
}

function detectEol(text) {
    return text.includes('\r\n') ? '\r\n' : '\n'
}

function encodePath(slug) {
    return slug.split('/').map(encodeURIComponent).join('/')
}

/** Find a path on disk even when its recorded case differs (Windows). */
function resolveOnDisk(relPath) {
    let current = CONTENT
    for (const wanted of relPath.split('/')) {
        if (!fs.existsSync(current)) return null
        const hit = fs
            .readdirSync(current)
            .find((name) => name.toLowerCase() === wanted.toLowerCase())
        if (!hit) return null
        current = path.join(current, hit)
    }
    return current
}

/* ------------------------------------------------------------------ *
 * 1. Plan, from the last commit rather than from disk
 *
 * The working tree may be mid-migration; HEAD is the reliable record of the
 * original layout.
 * ------------------------------------------------------------------ */

const tracked = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', 'content'], {
    cwd: ROOT,
    encoding: 'utf8',
})
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((p) => p.replace(/^content\//, ''))
    .filter((rel) => rel.endsWith('.md') || rel.endsWith('_meta.json'))
    .filter((rel) => !LOCALES.some((locale) => rel.startsWith(`${locale}/`)))

// Collapse the case-duplicate directory entries HEAD carries.
const originals = [...new Map(tracked.map((rel) => [rel.toLowerCase(), rel])).values()].sort()

const plan = []
const slugMap = new Map() // lowercased old slug -> new slug
const seenTargets = new Map()

for (const rel of originals) {
    const parts = rel.split('/')
    const base = parts.pop()
    const locale = POLISH.has(rel.toLowerCase()) ? 'pl' : DEFAULT_LOCALE

    const dirSlugs = parts.map(slugFor)
    const isMeta = base === '_meta.json'
    const isIndex = base === 'index.md'

    const newBase = isMeta
        ? '_meta.json'
        : isIndex
            ? 'index.md'
            : `${slugFor(base.replace(/\.md$/, ''))}.md`

    const newRel = [locale, ...dirSlugs, newBase].join('/')

    let oldSlug = null
    let newSlug = null
    if (!isMeta) {
        oldSlug = isIndex ? parts.join('/') : rel.replace(/\.md$/, '')
        newSlug = isIndex
            ? dirSlugs.join('/')
            : [...dirSlugs, newBase.replace(/\.md$/, '')].join('/')

        const clash = seenTargets.get(newSlug)
        if (clash) console.warn(`COLLISION: ${rel} and ${clash} both slugify to ${newSlug}`)
        seenTargets.set(newSlug, rel)
        slugMap.set(oldSlug.toLowerCase(), newSlug)
    }

    plan.push({ rel, newRel, locale, oldSlug, newSlug })
}

// Directories are routable too (generated section indexes), so they need
// redirect entries even without an index.md.
for (const rel of originals) {
    const parts = rel.split('/')
    parts.pop()
    for (let i = 1; i <= parts.length; i++) {
        const oldDir = parts.slice(0, i).join('/')
        if (!slugMap.has(oldDir.toLowerCase())) {
            slugMap.set(oldDir.toLowerCase(), parts.slice(0, i).map(slugFor).join('/'))
        }
    }
}

const pending = plan.filter((p) => !fs.existsSync(path.join(CONTENT, ...p.newRel.split('/'))))

console.log(`${plan.length} files in plan, ${pending.length} still to move, ${slugMap.size} routable slugs\n`)
const width = Math.max(...plan.map((p) => p.rel.length))
for (const p of plan) {
    const done = !pending.includes(p)
    console.log(`  ${done ? 'ok  ' : 'move'} ${p.rel.padEnd(width)}  ->  ${p.newRel}`)
}

if (!APPLY) {
    console.log('\nDry run. Re-run with --apply to perform it.')
    process.exit(0)
}

/* ------------------------------------------------------------------ *
 * 2. Move
 * ------------------------------------------------------------------ */

let moved = 0
for (const p of pending) {
    const from = resolveOnDisk(p.rel)
    if (!from) {
        console.warn(`  missing on disk, skipped: ${p.rel}`)
        continue
    }
    const to = path.join(CONTENT, ...p.newRel.split('/'))
    fs.mkdirSync(path.dirname(to), { recursive: true })
    fs.renameSync(from, to)
    moved += 1
}
console.log(`\nmoved ${moved} files`)

// Drop whatever is left of the old layout (now empty directories only).
function pruneEmpty(dir) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) pruneEmpty(path.join(dir, entry.name))
    }
    if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir)
}
for (const entry of fs.readdirSync(CONTENT, { withFileTypes: true })) {
    if (entry.isDirectory() && !LOCALES.includes(entry.name)) {
        pruneEmpty(path.join(CONTENT, entry.name))
    }
}

/* ------------------------------------------------------------------ *
 * 3. Frontmatter + link rewriting
 * ------------------------------------------------------------------ */

function yamlScalar(value) {
    const text = String(value ?? '')
    const safe = /^[A-Za-z0-9][^:#\n"'{}[\]&*!|>%@`]*$/.test(text) && !text.endsWith(' ')
    return safe ? text : JSON.stringify(text)
}

function buildFrontmatter(data, eol) {
    const ordered = ['title', 'description', 'headline']
    const keys = [
        ...ordered.filter((k) => k in data),
        ...Object.keys(data).filter((k) => !ordered.includes(k)),
    ]
    return ['---', ...keys.map((k) => `${k}: ${yamlScalar(data[k])}`), '---'].join(eol)
}

function rewriteTarget(href, oldSlug) {
    let raw = href
    let fromLocalhost = false

    if (LOCAL_ORIGIN.test(raw)) {
        raw = raw.replace(LOCAL_ORIGIN, '')
        fromLocalhost = true
    } else if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) {
        return null // genuinely external
    }

    if (raw.startsWith('#') || raw === '') return null

    let resolved
    try {
        resolved = new URL(raw, `http://x/${encodePath(oldSlug)}`)
    } catch {
        return null
    }

    const target = decodeURIComponent(resolved.pathname).replace(/^\/+/, '')
    const mapped = slugMap.get(target.toLowerCase())

    if (!mapped) {
        console.warn(`  unresolved link in ${oldSlug}: ${href}`)
        return null
    }

    return { url: `/${mapped}${resolved.hash}`, fromLocalhost }
}

let linksRewritten = 0
let localhostFixed = 0
let headlinesExtracted = 0
let titlesBackfilled = 0
const descriptionsMissing = []

for (const p of plan) {
    if (!p.oldSlug) continue

    const abs = path.join(CONTENT, ...p.newRel.split('/'))
    if (!fs.existsSync(abs)) continue

    const original = fs.readFileSync(abs, 'utf8')
    const eol = detectEol(original)
    const parsed = matter(original)
    const hadFrontmatter = Object.keys(parsed.data).length > 0
    let body = parsed.content

    // --- links: patch by AST offset, right to left ---
    const edits = []
    visit(fromMarkdown(body), (node) => {
        if (node.type !== 'link' && node.type !== 'image' && node.type !== 'definition') return
        if (!node.url || !node.position) return
        const next = rewriteTarget(node.url, p.oldSlug)
        if (!next || next.url === node.url) return
        edits.push({ node, ...next })
    })

    const spans = edits
        .map((edit) => {
            const start = edit.node.position.start.offset
            const source = body.slice(start, edit.node.position.end.offset)
            const at = source.lastIndexOf(edit.node.url)
            return at === -1
                ? null
                : { from: start + at, to: start + at + edit.node.url.length, ...edit }
        })
        .filter(Boolean)
        .sort((a, b) => b.from - a.from)

    for (const span of spans) {
        body = body.slice(0, span.from) + span.url + body.slice(span.to)
        linksRewritten += 1
        if (span.fromLocalhost) localhostFixed += 1
    }

    // --- frontmatter ---
    const data = { ...parsed.data }
    const originalBase = p.rel.split('/').pop().replace(/\.md$/, '')

    if (!data.title) {
        // Today's filenames ARE the sidebar labels, so the human name has to
        // survive slugification by moving into the frontmatter.
        data.title = originalBase === 'index' ? p.rel.split('/').slice(-2, -1)[0] : originalBase
        titlesBackfilled += 1
    }

    // Promote a leading H1 to `headline` only where the author already
    // distinguished a nav label from a page heading. In a file with no
    // frontmatter at all the H1 is a section heading, not a title - leave it.
    if (hadFrontmatter) {
        const firstNode = fromMarkdown(body).children[0]
        if (firstNode?.type === 'heading' && firstNode.depth === 1) {
            const text = nodeToString(firstNode).trim()
            if (text && text !== data.title) {
                data.headline = text
                headlinesExtracted += 1
            }
            body = body.slice(firstNode.position.end.offset)
        }
    }

    if (!data.description) {
        data.description = ''
        descriptionsMissing.push(p.newRel)
    }

    const cleanBody = body.replace(/^(\r?\n)+/, '')
    fs.writeFileSync(abs, `${buildFrontmatter(data, eol)}${eol}${eol}${cleanBody}`)
}

/* ------------------------------------------------------------------ *
 * 4. _meta.json with an explicit order, seeded with today's ordering
 * ------------------------------------------------------------------ */

function seedMeta(dirAbs, dirName) {
    const children = []
    for (const entry of fs.readdirSync(dirAbs, { withFileTypes: true })) {
        if (entry.isDirectory()) children.push({ name: entry.name, isDirectory: true })
        else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
            children.push({ name: entry.name.replace(/\.md$/, ''), isDirectory: false })
        }
    }
    if (children.length === 0) return

    children.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
        return a.name.localeCompare(b.name)
    })

    const metaPath = path.join(dirAbs, '_meta.json')
    const existing = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {}

    fs.writeFileSync(
        metaPath,
        `${JSON.stringify(
            {
                title: existing.title || dirName,
                description: existing.description || '',
                order: children.map((c) => c.name),
            },
            null,
            2
        )}\n`
    )

    for (const child of children.filter((c) => c.isDirectory)) {
        seedMeta(path.join(dirAbs, child.name), child.name)
    }
}

for (const locale of LOCALES) {
    const localeRoot = path.join(CONTENT, locale)
    if (!fs.existsSync(localeRoot)) continue
    for (const entry of fs.readdirSync(localeRoot, { withFileTypes: true })) {
        if (entry.isDirectory()) seedMeta(path.join(localeRoot, entry.name), entry.name)
    }
}

/* ------------------------------------------------------------------ *
 * 5. Redirect map
 * ------------------------------------------------------------------ */

const redirects = Object.fromEntries(
    [...slugMap.entries()]
        .filter(([from, to]) => from !== to)
        .sort(([a], [b]) => a.localeCompare(b))
)
fs.writeFileSync(
    path.join(ROOT, 'lib', 'legacy-redirects.json'),
    `${JSON.stringify(redirects, null, 2)}\n`
)

console.log(`
links rewritten      ${linksRewritten} (${localhostFixed} were hardcoded localhost)
titles backfilled    ${titlesBackfilled}
headlines extracted  ${headlinesExtracted}
redirect entries     ${Object.keys(redirects).length}
descriptions to write by hand: ${descriptionsMissing.length}`)
for (const rel of descriptionsMissing) console.log(`  ${rel}`)
