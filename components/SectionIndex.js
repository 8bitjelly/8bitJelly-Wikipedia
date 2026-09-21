import DocCard from './DocCard'

/**
 * Lists a section's direct children.
 *
 * Used two ways: as the entire body of a directory that has no index.md (11 of
 * them - these used to render a "page not found" card with an HTTP 200), and as
 * an "In this section" block under a directory that does have one.
 */
export default function SectionIndex({ items = [], heading = 'In this section' }) {
    if (items.length === 0) return null

    return (
        <section aria-labelledby="section-index-heading">
            <h2
                id="section-index-heading"
                className="text-lg font-semibold text-ink mb-6"
            >
                {heading}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((child) => (
                    <DocCard
                        key={child.slug}
                        href={`/${child.slug}`}
                        title={child.title}
                        description={child.description}
                        isDirectory={child.isDirectory}
                        cta={child.isDirectory ? 'Browse section' : 'Read article'}
                    />
                ))}
            </div>
        </section>
    )
}
