import Head from 'next/head'
import { getNavTree, getSectionChildren } from '@/lib/docs'
import DocCard from '@/components/DocCard'

export default function Home({ sections }) {
    return (
        <>
            <Head>
                <title>8BitJelly | Wiki</title>
                <meta
                    name="description"
                    content="Project guides, architecture overviews and team coding standards."
                />
            </Head>

            <header className="mb-8 pb-6 border-b border-slate-200">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                    Welcome to our Wiki
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                    Explore our project guides, architecture overviews, and team coding standards.
                </p>
            </header>

            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Getting Started</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sections.map((section) => (
                        <DocCard
                            key={section.slug}
                            href={`/${section.slug}`}
                            title={section.title}
                            description={section.description}
                            isDirectory={section.isDirectory}
                            cta="Explore category"
                        />
                    ))}
                </div>
            </section>
        </>
    )
}

export async function getStaticProps() {
    // Descriptions come from each section's index.md / _meta.json, so the cards
    // finally show real copy instead of a hardcoded fallback sentence.
    const sections = getSectionChildren('')
        .filter((section) => section.isDirectory)
        .slice(0, 4)

    return {
        props: {
            tree: getNavTree(),
            currentSlug: '',
            sections,
        },
    }
}
