'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Mic2,
  Handshake,
  Radio,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Globe,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',            label: 'Overview',   icon: LayoutDashboard, exact: true },
  { href: '/dashboard/team',       label: 'Team',       icon: Users },
  { href: '/dashboard/speakers',   label: 'Speakers',   icon: Mic2 },
  { href: '/dashboard/partners',   label: 'Partners',   icon: Handshake },
  { href: '/dashboard/podcasts',   label: 'Podcasts',   icon: Radio },
  { href: '/dashboard/marketing',  label: 'Marketing',  icon: ImageIcon },
  { href: '/dashboard/settings',   label: 'Settings',   icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 min-h-screen bg-brand-900 flex flex-col">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-brand-700">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌱</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">GORS</p>
            <p className="text-brand-400 text-xs leading-tight">Regen Summit</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
                ${active
                  ? 'bg-brand-600 text-white'
                  : 'text-brand-300 hover:bg-brand-800 hover:text-white'
                }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-4 border-t border-brand-700 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-brand-300 hover:bg-brand-800 hover:text-white transition"
        >
          <Globe size={17} />
          Public Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-brand-300 hover:bg-brand-800 hover:text-white transition"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
