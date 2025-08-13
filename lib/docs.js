import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const docsDirectory = path.join(process.cwd(), 'content')

function getDocFilePaths() {
    return getAllFiles(docsDirectory).filter((file) => file.endsWith('.md'))
}

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(dirPath, file))
        }
    })

    return arrayOfFiles
}

function getBreadcrumbs(filePath) {
    const relativePath = path.relative(docsDirectory, filePath)
    const dirs = path.dirname(relativePath).split(path.sep)
    const crumbs = []

    let currentPath = ''
    dirs.forEach((dir) => {
        if (dir === '.') return
        currentPath = [currentPath, dir].filter(Boolean).join('/')
        const fullPath = path.join(docsDirectory, currentPath, '_meta.json')

        try {
            const meta = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
            crumbs.push({
                slug: currentPath,
                title: meta.title,
            })
        } catch (e) {
            crumbs.push({
                slug: currentPath,
                title: dir.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' '),
            })
        }
    })

    return crumbs
}

export function getAllDocs() {
    const filePaths = getDocFilePaths()
    const allItems = {}

    // First pass - collect all items including index files
    filePaths.forEach((filePath) => {
        const relativePath = path.relative(docsDirectory, filePath)
        const parts = relativePath.replace(/\.md$/, '').split(path.sep)
        const isIndexFile = parts[parts.length - 1] === 'index'

        let currentPath = ''
        let currentLevel = allItems

        parts.forEach((part, index) => {
            const isLastPart = index === parts.length - 1
            currentPath = currentPath ? `${currentPath}/${part}` : part

            if (!currentLevel[part]) {
                currentLevel[part] = {
                    name: part,
                    path: currentPath,
                    isDirectory: !isLastPart,
                    hasIndex: false,
                    children: {}
                }
            }

            // Mark parent directory as having an index file
            if (isIndexFile && index === parts.length - 2) {
                currentLevel[part].hasIndex = true
            }

            currentLevel = currentLevel[part].children
        })
    })

    // Second pass - build hierarchy while hiding index items
    function buildHierarchy(items) {
        return Object.values(items)
            .filter(item => {
                // Keep directories and non-index files
                if (item.isDirectory) return true
                return item.name !== 'index'
            })
            .sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1
                if (!a.isDirectory && b.isDirectory) return 1
                return a.name.localeCompare(b.name)
            })
            .map(item => {
                const title = item.name
                    .split('-')
                    .map(s => s[0].toUpperCase() + s.slice(1))
                    .join(' ')

                return {
                    slug: item.path,
                    title,
                    isDirectory: item.isDirectory,
                    hasIndex: item.hasIndex,
                    children: buildHierarchy(item.children)
                }
            })
    }

    return buildHierarchy(allItems)
}

export function getDocBySlug(slug) {
    // First try the exact path
    let fullPath = path.join(docsDirectory, `${slug}.md`)

    // If not found and it looks like a directory, try index.md
    if (!fs.existsSync(fullPath)) {
        const dirPath = path.join(docsDirectory, slug)
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
            fullPath = path.join(dirPath, 'index.md')
            if (!fs.existsSync(fullPath)) {
                return null
            }
        } else {
            return null
        }
    }

    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)

        return {
            slug,
            content,
            meta: {
                title: data.title || slug.split('/').pop().replace(/-/g, ' '),
                description: data.description || '',
            },
            breadcrumbs: getBreadcrumbs(fullPath),
        }
    } catch (e) {
        return null
    }
}