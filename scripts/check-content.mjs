/**
 * Content health check. Runs from `prebuild`, so a broken link or a bad filename
 * fails the build instead of shipping.
 *
 *   node scripts/check-content.mjs
 *
 * Errors fail the build. Warnings are printed and tolerated - there is existing
 * content with blank descriptions and missing translations, and neither should
 * stop a deploy.
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { visit } from 'unist-util-visit'
import { getAllDocSlugs, getNavTree } from '../lib/docs.js'
import { DEFAULT_LOCALE, LOCALES } from '../lib/locales.js'

const CONTENT = path.join(process.cwd(), 'content')
const SEGMENT = /^[a-z0-9-]+$/

const errors = []
const warnings = []

const error = (message) => errors.push(message)
const warn = (message) => warnings.push(message)

/* ------------------------------------------------------------------ *
 * Walk every locale tree
 * ------------------------------------------------------------------ */

function walk(dir, out = []) {
    if (!fs.existsSync(dir)) return out
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(abs, out)
        else out.push(abs)
    }
    return out
}

const knownSlugs = new Set(getAllDocSlugs())
const files = []

for (const locale of LOCALES) {
    const root = path.join(CONTENT, locale)
    if (!fs.existsSync(root)) {
        warn(`content/${locale}/ does not exist`)
        continue
    }

    for (const abs of walk(root)) {
        const rel = path.relative(root, abs).split(path.sep).join('/')

        if (!abs.endsWith('.md') && !abs.endsWith('_meta.json')) {
            warn(`${locale}/${rel}: unexpected file in content/`)
            continue
        }

        // Path segments are the URL. Anything outside [a-z0-9-] means a file was
        // added without slugifying its name, which lib/docs.js will refuse to serve.
        const segments = rel.split('/')
        for (const segment of segments.slice(0, -1)) {
            if (!SEGMENT.test(segment)) {
                error(`${locale}/${rel}: directory "${segment}" is not a valid slug segment`)
            }
        }
        const base = segments[segments.length - 1]
        if (base.endsWith('.md') && base !== 'index.md') {
            const name = base.replace(/\.md$/, '')
            if (!SEGMENT.test(name)) {
                error(`${locale}/${rel}: filename "${name}" is not a valid slug segment`)
            }
        }

        if (abs.endsWith('.md')) files.push({ locale, rel, abs })
    }
}

/* ------------------------------------------------------------------ *
 * Frontmatter and links
 * ------------------------------------------------------------------ */

function slugOf(rel) {
    return rel.replace(/\.md$/, '').replace(/\/?index$/, '')
}

for (const { locale, rel, abs } of files) {
    const slug = slugOf(rel)
    const { data, content } = matter(fs.readFileSync(abs, 'utf8'))

    if (!data.title || String(data.title).trim() === '') {
        error(`${locale}/${rel}: missing frontmatter title`)
    }
    if (!('description' in data)) {
        error(`${locale}/${rel}: missing frontmatter description key`)
    } else if (String(data.description).trim() === '') {
        warn(`${locale}/${rel}: description is empty`)
    }

    visit(fromMarkdown(content), (node) => {
        if (node.type !== 'link' && node.type !== 'image' && node.type !== 'definition') return
        const url = node.url
        if (!url || url.startsWith('#')) return

        if (/^https?:\/\/localhost/i.test(url)) {
            error(`${locale}/${rel}: hardcoded localhost link ${url}`)
            return
        }
        if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) return // external
        if (node.type === 'image') return // relative images would be local assets

        let resolved
        try {
            resolved = new URL(url, `http://x/${slug.split('/').map(encodeURIComponent).join('/')}`)
        } catch {
            error(`${locale}/${rel}: unparseable link ${url}`)
            return
        }

        const target = decodeURIComponent(resolved.pathname).replace(/^\/+/, '')
        if (!knownSlugs.has(target)) {
            error(`${locale}/${rel}: link ${url} resolves to "${target}", which is not a page`)
        }
    })
}

/* ------------------------------------------------------------------ *
 * _meta.json order drift
 * ------------------------------------------------------------------ */

function checkMeta(dirAbs, label) {
    const metaPath = path.join(dirAbs, '_meta.json')
    if (!fs.existsSync(metaPath)) return

    let meta
    try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    } catch (cause) {
        error(`${label}/_meta.json: invalid JSON (${cause.message})`)
        return
    }

    if (!meta.title) warn(`${label}/_meta.json: no title, the sidebar will show the raw slug`)
    if (!Array.isArray(meta.order)) return

    const present = new Set()
    for (const entry of fs.readdirSync(dirAbs, { withFileTypes: true })) {
        if (entry.isDirectory()) present.add(entry.name)
        else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
            present.add(entry.name.replace(/\.md$/, ''))
        }
    }

    for (const name of meta.order) {
        if (!present.has(name)) warn(`${label}/_meta.json: order lists "${name}", which is not there`)
    }
    for (const name of present) {
        if (!meta.order.includes(name)) {
            warn(`${label}/_meta.json: "${name}" is missing from order, it will sort last`)
        }
    }
}

function walkDirs(dirAbs, label) {
    checkMeta(dirAbs, label)
    for (const entry of fs.readdirSync(dirAbs, { withFileTypes: true })) {
        if (entry.isDirectory()) walkDirs(path.join(dirAbs, entry.name), `${label}/${entry.name}`)
    }
}

for (const locale of LOCALES) {
    const root = path.join(CONTENT, locale)
    if (!fs.existsSync(root)) continue
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (entry.isDirectory()) walkDirs(path.join(root, entry.name), `${locale}/${entry.name}`)
    }
}

/* ------------------------------------------------------------------ *
 * Translation coverage
 * ------------------------------------------------------------------ */

const coverage = new Map()
const collect = (nodes) => {
    for (const node of nodes) {
        if (!node.isDirectory) coverage.set(node.slug, node.availableIn)
        if (node.children?.length) collect(node.children)
    }
}
collect(getNavTree(DEFAULT_LOCALE))

const missing = {}
for (const locale of LOCALES) {
    missing[locale] = [...coverage.entries()]
        .filter(([, available]) => !available.includes(locale))
        .map(([slug]) => slug)
}

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */

console.log(`content check: ${files.length} articles across ${LOCALES.length} locales`)

for (const locale of LOCALES) {
    const count = missing[locale].length
    const total = coverage.size
    console.log(`  ${locale}: ${total - count}/${total} translated`)
}

if (warnings.length > 0) {
    console.log(`\n${warnings.length} warnings`)
    for (const message of warnings) console.log(`  warn  ${message}`)
}

if (errors.length > 0) {
    console.log(`\n${errors.length} errors`)
    for (const message of errors) console.log(`  ERROR ${message}`)
    process.exit(1)
}

console.log('\nno errors')
