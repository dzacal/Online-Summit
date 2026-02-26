import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PublicHomePage() {
  const supabase = await createClient()

  // Fetch confirmed public data
  const [{ data: speakers }, { data: partners }] = await Promise.all([
    supabase.from('speakers').select('full_name, organization, title, topic, session_type').eq('confirmed', true).order('full_name'),
    supabase.from('partners').select('organization, partnership_type, website, social_handle').eq('agreement_signed', true).order('organization'),
  ])

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="font-bold text-gray-900 text-sm tracking-tight">GORS</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <a href="#speakers" className="hover:text-brand-600 transition">Speakers</a>
          <a href="#partners" className="hover:text-brand-600 transition">Partners</a>
          <Link href="/login" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg transition font-medium">
            Team Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-green-900 text-white px-6 py-28 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-brand-300 text-sm font-medium uppercase tracking-widest mb-4">Coming Soon</p>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Global Online<br />Regeneration Summit
          </h1>
          <p className="text-brand-200 text-xl max-w-xl mx-auto leading-relaxed">
            A global gathering of regenerative thinkers, practitioners, and changemakers. Online. Open. Transformative.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <a href="#speakers" className="bg-brand-500 hover:bg-brand-400 text-white font-semibold px-6 py-3 rounded-xl transition">
              Meet the Speakers
            </a>
            <a href="#partners" className="border border-brand-400 hover:border-white text-brand-200 hover:text-white font-semibold px-6 py-3 rounded-xl transition">
              Our Partners
            </a>
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="bg-brand-700 text-white px-6 py-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-12 text-center">
          <div>
            <p className="text-3xl font-bold">{speakers?.length ?? 0}+</p>
            <p className="text-brand-300 text-sm mt-0.5">Confirmed Speakers</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{partners?.length ?? 0}+</p>
            <p className="text-brand-300 text-sm mt-0.5">Partner Organizations</p>
          </div>
          <div>
            <p className="text-3xl font-bold">100%</p>
            <p className="text-brand-300 text-sm mt-0.5">Online & Free</p>
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section id="speakers" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Speakers</h2>
          <p className="text-gray-500 mt-2">World-class voices in regeneration and systems change</p>
        </div>
        {speakers && speakers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg mb-4">
                  {s.full_name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{s.full_name}</h3>
                {s.title && <p className="text-gray-500 text-sm mt-0.5">{s.title}</p>}
                {s.organization && <p className="text-brand-600 text-sm font-medium mt-0.5">{s.organization}</p>}
                {s.topic && (
                  <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-2">{s.topic}</p>
                )}
                {s.session_type && (
                  <span className="inline-block mt-3 text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium">
                    {s.session_type}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Speakers will be announced soon.</p>
          </div>
        )}
      </section>

      {/* Partners */}
      <section id="partners" className="bg-gray-50 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Partners</h2>
            <p className="text-gray-500 mt-2">Organizations making this summit possible</p>
          </div>
          {partners && partners.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {partners.map((p, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl px-6 py-4 hover:shadow-sm transition text-center min-w-[160px]">
                  {p.website ? (
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-800 hover:text-brand-600 transition">
                      {p.organization}
                    </a>
                  ) : (
                    <span className="font-semibold text-gray-800">{p.organization}</span>
                  )}
                  {p.partnership_type && (
                    <p className="text-xs text-gray-400 mt-1">{p.partnership_type}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">Partner announcements coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Global Online Regeneration Summit. All rights reserved.</p>
        <Link href="/login" className="text-brand-500 hover:underline mt-1 inline-block">Team Login</Link>
      </footer>
    </div>
  )
}
