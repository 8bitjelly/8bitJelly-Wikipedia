import { memo, useRef, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { visit } from 'unist-util-visit'
import { Check, Copy, ExternalLink, Link as LinkIcon } from 'lucide-react'

/**
 * Stamps the ids that lib/docs.js already generated onto the rendered
 * headings, in document order.
 *
 * This replaces rehype-slug deliberately. The table of contents renders the
 * same ordered array this consumes, so a TOC link that does not match a
 * heading id is not merely unlikely - it is impossible. Two independent
 * sluggers agreeing is a thing you have to keep verifying; one slugger is a
 * thing you cannot get wrong.
 */
function rehypeHeadingIds(options = {}) {
    const ids = options.ids || []

    return (tree) => {
        let index = 0
        visit(tree, 'element', (element) => {
            if (!/^h[1-6]$/.test(element.tagName)) return
            const id = ids[index++]
            if (id) element.properties.id = id
        })
    }
}

/** Resolves a content-relative href exactly as a browser would. */
function resolveInternal(href, slug) {
    try {
        const url = new URL(href, `http://x/${slug}`)
        return url.pathname + url.search + url.hash
    } catch {
        return href
    }
}

function makeHeading(Tag) {
    return function Heading({ id, children, ...rest }) {
        return (
            <Tag id={id} className="group scroll-mt-24" {...rest}>
                {children}
                {id && (
                    <a
                        href={`#${id}`}
                        aria-label="Permalink to this section"
                        className="ml-2 inline-flex align-middle text-ink-3 opacity-0 transition-opacity
                            group-hover:opacity-100 focus:opacity-100 hover:text-accent no-underline"
                    >
                        <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                )}
            </Tag>
        )
    }
}

/**
 * Code blocks get a copy button - 99 fenced blocks in a wiki about coding
 * standards, and the cheapest useful addition available.
 */
function Pre({ children, ...rest }) {
    const ref = useRef(null)
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(ref.current?.innerText ?? '')
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            /* clipboard blocked (insecure origin, denied permission) - stay quiet */
        }
    }

    return (
        <div className="relative group/code">
            <pre ref={ref} {...rest}>
                {children}
            </pre>
            <button
                type="button"
                onClick={copy}
                aria-label={copied ? 'Copied' : 'Copy code'}
                title={copied ? 'Copied' : 'Copy code'}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-md border border-code-line
                    bg-code-bg text-hl-comment opacity-0 transition-opacity
                    group-hover/code:opacity-100 focus:opacity-100 hover:text-hl-fg"
            >
                {copied ? (
                    <Check className="w-3.5 h-3.5 text-hl-tag" aria-hidden="true" />
                ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                )}
            </button>
        </div>
    )
}

function MarkdownRenderer({ content, headingIds = [], slug = '' }) {
    const components = {
        // A body h1 becomes an h2: the page header already owns the only h1.
        h1: makeHeading('h2'),
        h2: makeHeading('h2'),
        h3: makeHeading('h3'),
        h4: makeHeading('h4'),
        pre: Pre,

        a({ href = '', children, ...rest }) {
            if (href.startsWith('#')) {
                return (
                    <a href={href} {...rest}>
                        {children}
                    </a>
                )
            }

            const isExternal = /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')
            if (isExternal) {
                return (
                    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                        {children}
                        <ExternalLink
                            className="inline-block w-3 h-3 ml-0.5 align-baseline"
                            aria-hidden="true"
                        />
                    </a>
                )
            }

            // Internal links go through next/link, so following one is a client
            // navigation instead of a full page reload.
            return (
                <Link href={resolveInternal(href, slug)} {...rest}>
                    {children}
                </Link>
            )
        },

        // Not next/image: every image in the corpus is a remote imgur URL and
        // markdown carries no dimensions, so it could not prevent CLS anyway.
        img({ src, alt, ...rest }) {
            return <img src={src} alt={alt || ''} loading="lazy" decoding="async" {...rest} />
        },
    }

    return (
        <div className="markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeHeadingIds, { ids: headingIds }], rehypeHighlight]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

// Memoized because ReactMarkdown re-parses the entire document on every render.
export default memo(MarkdownRenderer)
