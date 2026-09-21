import { useEffect, useId, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { useT } from '@/lib/i18n'

/**
 * Tabs trip up some Mermaid grammars, and one diagram in content/ is indented
 * with them. Normalising here rather than editing the markdown means every
 * future diagram pasted in with tabs works too.
 */
function normalizeSource(source) {
    return String(source).replace(/\t/g, '    ').trim()
}

/**
 * Renders one ```mermaid fence as SVG.
 *
 * Mermaid is imported dynamically *inside the effect*, which is why this needs
 * no next/dynamic wrapper: the import never evaluates on the server, and
 * webpack still splits it into its own async chunk, so the 47 articles without
 * diagrams download none of it.
 */
export default function MermaidDiagram({ source }) {
    const { resolved, mounted } = useTheme()
    const t = useT()
    const reactId = useId()

    const [svg, setSvg] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        // `resolved` reports 'light' during SSR and the first paint, because
        // `mounted` only flips in ThemeProvider's first effect. Rendering before
        // that would paint a light diagram and then swap it for a dark one.
        if (!mounted) return

        let cancelled = false

        const render = async () => {
            try {
                const mermaid = (await import('mermaid')).default

                mermaid.initialize({
                    startOnLoad: false,
                    // Built-in themes only. Our design tokens are oklch(), and
                    // Mermaid runs themeVariables through khroma's colour maths,
                    // which does not understand oklch - it would either throw or
                    // produce wrong colours. The wiki palette styles the
                    // container instead (see .mermaid-figure in globals.css).
                    theme: resolved === 'dark' ? 'dark' : 'default',
                    // Let our own fallback handle failures instead of Mermaid
                    // injecting its "Syntax error" graphic into the DOM.
                    suppressErrorRendering: true,
                    securityLevel: 'strict',
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                    // Seven labels in the content use <br/>, which only works
                    // with HTML labels on.
                    flowchart: { htmlLabels: true, useMaxWidth: true },
                })

                const id = `mmd-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`
                const result = await mermaid.render(id, normalizeSource(source))

                if (cancelled) return
                setSvg(result.svg)
                setError(null)
            } catch (cause) {
                if (cancelled) return
                setSvg(null)
                setError(cause?.message || String(cause))
            }
        }

        render()

        // React StrictMode double-invokes effects in dev and mermaid.render is
        // async, so without this the second pass can setState after unmount.
        return () => {
            cancelled = true
        }
    }, [source, resolved, mounted, reactId])

    // A hand-written diagram with a typo must not blank out the page. Show the
    // source so the information is still there.
    if (error) {
        return (
            <div className="my-6 rounded-lg border border-line bg-surface-2 overflow-hidden">
                <p className="flex items-start gap-2 px-4 py-3 text-sm text-ink-2 border-b border-line">
                    <TriangleAlert
                        className="mt-0.5 w-4 h-4 flex-shrink-0 text-ink-3"
                        aria-hidden="true"
                    />
                    <span>
                        <span className="font-semibold text-ink">{t('diagram.errorTitle')}</span>{' '}
                        {t('diagram.errorBody')}
                        <span className="block mt-1 text-xs text-ink-3 font-mono">{error}</span>
                    </span>
                </p>
                <pre className="!my-0 !rounded-none !border-0">
                    <code>{normalizeSource(source)}</code>
                </pre>
            </div>
        )
    }

    if (!svg) {
        // min-height keeps the article from jumping once the SVG lands, which
        // also stops it fighting experimental.scrollRestoration.
        return (
            <div
                className="mermaid-figure flex items-center justify-center min-h-40 text-sm text-ink-3"
                aria-busy="true"
            >
                {t('diagram.loading')}
            </div>
        )
    }

    return (
        <figure
            className="mermaid-figure"
            role="img"
            aria-label={t('diagram.label')}
            // Mermaid output built from our own repo content, with
            // securityLevel: 'strict' sanitising labels.
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    )
}
