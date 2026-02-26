import { createClient } from '@/lib/supabase/server'
import { Users, Mic2, Handshake, Radio, ImageIcon, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [team, speakers, partners, podcasts, assets] = await Promise.all([
    supabase.from('team_members').select('id', { count: 'exact', head: true }),
    supabase.from('speakers').select('id, confirmed', { count: 'exact' }),
    supabase.from('partners').select('id, partnership_status', { count: 'exact' }),
    supabase.from('podcasts').select('id, confirmed', { count: 'exact' }),
    supabase.from('marketing_assets').select('id', { count: 'exact', head: true }),
  ])
  return {
    teamCount:             team.count ?? 0,
    speakerTotal:          speakers.count ?? 0,
    speakersConfirmed:     (speakers.data ?? []).filter(s => s.confirmed).length,
    partnerTotal:          partners.count ?? 0,
    partnersConfirmed:     (partners.data ?? []).filter(p => p.partnership_status === 'Confirmed' || p.partnership_status === 'Active').length,
    podcastTotal:          podcasts.count ?? 0,
    podcastsConfirmed:     (podcasts.data ?? []).filter(p => p.confirmed).length,
    assetsCount:           assets.count ?? 0,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const stats = await getStats(supabase)

  const cards = [
    { label: 'Team Members',       value: stats.teamCount,         sub: 'total',                    icon: Users,     href: '/dashboard/team',      color: 'bg-blue-50 text-blue-600' },
    { label: 'Speakers',           value: stats.speakersConfirmed, sub: `of ${stats.speakerTotal} confirmed`, icon: Mic2, href: '/dashboard/speakers', color: 'bg-green-50 text-green-600' },
    { label: 'Partners',           value: stats.partnersConfirmed, sub: `of ${stats.partnerTotal} confirmed`, icon: Handshake, href: '/dashboard/partners', color: 'bg-purple-50 text-purple-600' },
    { label: 'Podcasts',           value: stats.podcastsConfirmed, sub: `of ${stats.podcastTotal} booked`,   icon: Radio, href: '/dashboard/podcasts', color: 'bg-orange-50 text-orange-600' },
    { label: 'Marketing Assets',   value: stats.assetsCount,       sub: 'total assets',             icon: ImageIcon, href: '/dashboard/marketing', color: 'bg-pink-50 text-pink-600' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Global Online Regeneration Summit — Operations Hub</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {cards.map(({ label, value, sub, icon: Icon, href, color }) => (
          <Link key={href} href={href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition group">
            <div className={`inline-flex p-2.5 rounded-lg ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900 group-hover:text-brand-600 transition">{value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={18} className="text-brand-600" />
          <h2 className="font-semibold text-brand-800">Quick Links</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: 'Add a speaker',  href: '/dashboard/speakers' },
            { label: 'Add a partner',  href: '/dashboard/partners' },
            { label: 'Add team member', href: '/dashboard/team' },
            { label: 'Log a podcast',  href: '/dashboard/podcasts' },
            { label: 'Upload asset',   href: '/dashboard/marketing' },
            { label: 'View public site', href: '/' },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className="text-sm text-brand-700 hover:text-brand-900 hover:underline transition">
              → {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
