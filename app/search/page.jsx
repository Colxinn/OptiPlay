import Link from 'next/link';
import { loadSearchIndex, searchIndex } from '@/lib/searchIndex';

export const dynamic = 'force-dynamic';

export default function SearchPage({ searchParams }) {
  const query = (searchParams?.q || '').trim();
  const matches = searchIndex(query);
  const fallback = loadSearchIndex().slice(0, 6);
  const recommendations = matches.length ? matches.slice(0, 6) : fallback;

  return (
    <div className='max-w-4xl mx-auto px-4 py-10 space-y-8'>
      <header className='space-y-2'>
        <h1 className='text-2xl font-bold text-purple-100'>Search</h1>
        <form className='flex gap-3' action='/search'>
          <input
            className='flex-1 rounded-lg border border-white/10 bg-[#0b0b10] px-3 py-2 text-sm text-gray-200'
            placeholder='Search OptiPlay tools, pages, and news...'
            name='q'
            defaultValue={query}
          />
          <button className='rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600'>
            Search
          </button>
        </form>
        <p className='text-sm text-gray-400'>Found {matches.length} match{matches.length === 1 ? '' : 'es'}.</p>
      </header>

      <section className='space-y-3'>
        {matches.slice(0, 20).map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className='block rounded-xl border border-white/10 bg-neutral-900/70 p-4 hover:border-purple-500/60'
          >
            <div className='flex items-center justify-between text-xs uppercase tracking-wide text-purple-300'>
              <span>{entry.category}</span>
              <span className='text-gray-500'>{entry.href}</span>
            </div>
            <div className='mt-1 text-lg font-semibold text-white'>{entry.title}</div>
            <p className='text-sm text-gray-300'>{entry.description}</p>
          </Link>
        ))}
        {matches.length === 0 ? (
          <div className='rounded-xl border border-white/10 bg-neutral-900/60 p-4 text-sm text-gray-300'>
            No direct matches. Try these featured links:
            <div className='mt-3 grid gap-2 sm:grid-cols-2'>
              {recommendations.map((entry) => (
                <Link
                  key={`rec-${entry.href}`}
                  href={entry.href}
                  className='rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-2 text-sm text-purple-200 hover:border-purple-400/50'
                >
                  <div className='font-semibold text-white'>{entry.title}</div>
                  <div className='text-xs text-gray-300'>{entry.description}</div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

