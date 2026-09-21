/**
 * Writes public/search-index.<locale>.json, one file per locale.
 *
 * Wired to both `prebuild` and `predev` in package.json. The files are
 * gitignored - they are build output, regenerated from content/.
 */
import fs from 'node:fs'
import path from 'node:path'
import { buildSearchIndex } from '../lib/searchIndex.js'
import { LOCALES } from '../lib/locales.js'

const PUBLIC_DIR = path.join(process.cwd(), 'public')
fs.mkdirSync(PUBLIC_DIR, { recursive: true })

for (const locale of LOCALES) {
    const index = buildSearchIndex(locale)
    const file = path.join(PUBLIC_DIR, `search-index.${locale}.json`)
    const json = JSON.stringify(index)
    fs.writeFileSync(file, json)

    const sections = index.records.reduce((sum, record) => sum + record.sections.length, 0)
    console.log(
        `search index ${locale}: ${index.records.length} documents, ${sections} sections, ${(json.length / 1024).toFixed(0)} KB`
    )
}
