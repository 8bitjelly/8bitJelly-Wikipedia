/**
 * Repairs `_meta.json` titles after the slugify migration.
 *
 * The migration seeded new `_meta.json` files with the directory's slug
 * ("best-practices") rather than the human name it used to have
 * ("Best Practices"), because slugification had already happened by then. The
 * original names are still in HEAD, so recover them from there.
 *
 *   node scripts/restore-meta-titles.mjs            # dry run
 *   node scripts/restore-meta-titles.mjs --apply
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { slugifySegment } from '../lib/slug.js'

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content')
const APPLY = process.argv.includes('--apply')
const LOCALES = ['en', 'pl']

const SLUG_OVERRIDES = new Map([
    ['method seperation and decomposition', 'method-separation-and-decomposition'],
    ['levelsetup', 'level-setup'],
    ['systemarchitecture', 'system-architecture'],
    ['basebutton', 'base-button'],
    ['addlistener', 'add-listener'],
    ['scriptableobjects', 'scriptable-objects'],
])

const slugFor = (segment) => SLUG_OVERRIDES.get(segment.toLowerCase()) || slugifySegment(segment)

/** slug path (locale-independent) -> original human directory name */
const humanNames = new Map()

const tracked = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', 'content'], {
    cwd: ROOT,
    encoding: 'utf8',
})
    .split('\n')
    .map((line) => line.trim().replace(/^content\//, ''))
    .filter(Boolean)
    .filter((rel) => !LOCALES.some((locale) => rel.startsWith(`${locale}/`)))

for (const rel of tracked) {
    const dirs = rel.split('/').slice(0, -1)
    const slugs = []
    for (const dir of dirs) {
        slugs.push(slugFor(dir))
        // First spelling wins; HEAD carries case-duplicate entries
        // (Tutorials/ and tutorials/) and the capitalised one is the real name.
        const key = slugs.join('/')
        const existing = humanNames.get(key)
        if (!existing || (existing[0] === existing[0].toLowerCase() && dir[0] !== dir[0].toLowerCase())) {
            humanNames.set(key, dir)
        }
    }
}

let changed = 0
let unchanged = 0

function visit(dirAbs, slugPath) {
    for (const entry of fs.readdirSync(dirAbs, { withFileTypes: true })) {
        if (entry.isDirectory()) visit(path.join(dirAbs, entry.name), `${slugPath}/${entry.name}`)
    }

    const metaPath = path.join(dirAbs, '_meta.json')
    if (!fs.existsSync(metaPath)) return

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    const slugKey = slugPath.replace(/^\//, '')
    const human = humanNames.get(slugKey)

    if (!human || meta.title === human) {
        unchanged += 1
        return
    }

    console.log(`  ${slugKey}: ${JSON.stringify(meta.title)} -> ${JSON.stringify(human)}`)
    changed += 1

    if (APPLY) {
        meta.title = human
        fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`)
    }
}

for (const locale of LOCALES) {
    const root = path.join(CONTENT, locale)
    if (!fs.existsSync(root)) continue
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (entry.isDirectory()) visit(path.join(root, entry.name), entry.name)
    }
}

console.log(`\n${changed} titles ${APPLY ? 'restored' : 'to restore'}, ${unchanged} already correct`)
if (!APPLY) console.log('Dry run. Re-run with --apply.')
