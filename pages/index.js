import Head from 'next/head'
import { getNavTree, getSectionChildren } from '@/lib/docs'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { useT } from '@/lib/i18n'
import DocCard from '@/components/DocCard'

export default function Home({ sections }) {
    const t = useT()

    return (
        <>
            <Head>
                <title>8BitJelly | Wiki</title>
                <meta name="description" content={t('home.meta')} />
            </Head>

            <header className="mb-8 pb-6 border-b border-line">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
                    {t('home.title')}
                </h1>
                <p className="text-base sm:text-lg text-ink-2 max-w-2xl leading-relaxed">
                    {t('home.subtitle')}
                </p>
            </header>

            <section className="bg-surface rounded-xl border border-line shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-ink mb-6">{t('home.gettingStarted')}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sections.map((section) => (
                        <DocCard
                            key={section.slug}
                            href={`/${section.slug}`}
                            title={section.title}
                            description={section.description}
                            isDirectory={section.isDirectory}
                            cta={t('section.explore')}
                        />
                    ))}
                </div>
            </section>
        </>
    )
}

export async function getStaticProps({ locale = DEFAULT_LOCALE }) {
    // Descriptions come from each section's index.md / _meta.json, so the cards
    // finally show real copy instead of a hardcoded fallback sentence.
    const sections = getSectionChildren('', locale)
        .filter((section) => section.isDirectory)
        .slice(0, 4)

    return {
        props: {
            tree: getNavTree(locale),
            currentSlug: '',
            sections,
        },
    }
}
