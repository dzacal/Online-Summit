'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_SETTINGS, type Settings } from '@/lib/settings'
import { Save, Plus, X } from 'lucide-react'

type Tab = 'colors' | 'content' | 'dropdowns'

const COLOR_BRAND_SCALE = [
  { key: 'color_brand_50',  label: 'Brand 50  — lightest tint' },
  { key: 'color_brand_100', label: 'Brand 100 — linen' },
  { key: 'color_brand_200', label: 'Brand 200 — seafoam' },
  { key: 'color_brand_300', label: 'Brand 300 — cool gray' },
  { key: 'color_brand_400', label: 'Brand 400 — olive' },
  { key: 'color_brand_500', label: 'Brand 500 — sage (primary CTA)' },
  { key: 'color_brand_600', label: 'Brand 600 — teal' },
  { key: 'color_brand_700', label: 'Brand 700 — deep teal' },
  { key: 'color_brand_800', label: 'Brand 800 — charcoal' },
  { key: 'color_brand_900', label: 'Brand 900 — darkest' },
]

const COLOR_TOKENS = [
  { key: 'color_sage',          label: 'Sage Green' },
  { key: 'color_seafoam',       label: 'Seafoam' },
  { key: 'color_teal',          label: 'Teal' },
  { key: 'color_charcoal',      label: 'Charcoal' },
  { key: 'color_olive',         label: 'Olive' },
  { key: 'color_linen',         label: 'Linen' },
  { key: 'color_cool_gray',     label: 'Cool Gray' },
  { key: 'color_vision_purple', label: 'Vision Purple' },
]

const DROPDOWN_GROUPS = [
  { key: 'speaker_statuses', label: 'Speaker Response Statuses' },
  { key: 'session_types',    label: 'Session Types' },
  { key: 'partner_statuses', label: 'Partner Statuses' },
  { key: 'partner_types',    label: 'Partner Types' },
]

function ColorRow({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-md border border-gray-200 flex-shrink-0" style={{ backgroundColor: value }} />
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-9 h-8 rounded cursor-pointer border border-gray-300 p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-28 px-2 py-1.5 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-brand-500 outline-none"
      />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  )
}

export default function SettingsPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('colors')
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newItems, setNewItems] = useState<Record<string, string>>({})

  useEffect(() => { loadSettings() }, [])

  async function loadSettings() {
    setLoading(true)
    const { data } = await supabase.from('site_settings').select('key, value')
    if (data && data.length > 0) {
      const map: Record<string, string> = {}
      for (const row of data) map[row.key] = row.value
      setSettings(prev => ({ ...prev, ...map }) as Settings)
    }
    setLoading(false)
  }

  function set(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  function getDropdownItems(key: string): string[] {
    try { return JSON.parse((settings as any)[key] ?? '[]') }
    catch { return [] }
  }

  function removeDropdownItem(key: string, item: string) {
    const updated = getDropdownItems(key).filter(i => i !== item)
    set(key, JSON.stringify(updated))
  }

  function addDropdownItem(key: string) {
    const newItem = (newItems[key] ?? '').trim()
    if (!newItem) return
    const items = getDropdownItems(key)
    if (!items.includes(newItem)) {
      set(key, JSON.stringify([...items, newItem]))
    }
    setNewItems(prev => ({ ...prev, [key]: '' }))
  }

  async function handleSave() {
    setSaving(true)
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }))
    await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading settings…</div>
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Customize brand colors, site content, and dropdown options. Changes apply site-wide instantly.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
        {([
          ['colors',    'Colors'],
          ['content',   'Site Content'],
          ['dropdowns', 'Dropdown Options'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Colors Tab */}
      {tab === 'colors' && (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Brand Color Scale</h2>
            <p className="text-xs text-gray-400 mb-4">These map to <code>brand-50</code> through <code>brand-900</code> Tailwind classes used across the site.</p>
            <div className="space-y-3">
              {COLOR_BRAND_SCALE.map(({ key, label }) => (
                <ColorRow
                  key={key}
                  label={label}
                  value={(settings as any)[key] ?? '#000000'}
                  onChange={v => set(key, v)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Named Color Tokens</h2>
            <p className="text-xs text-gray-400 mb-4">Semantic aliases used directly in components.</p>
            <div className="space-y-3">
              {COLOR_TOKENS.map(({ key, label }) => (
                <ColorRow
                  key={key}
                  label={label}
                  value={(settings as any)[key] ?? '#000000'}
                  onChange={v => set(key, v)}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Content Tab */}
      {tab === 'content' && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Site Title</label>
            <input
              type="text"
              value={settings.site_title}
              onChange={e => set('site_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Tagline</label>
            <textarea
              rows={3}
              value={settings.site_tagline}
              onChange={e => set('site_tagline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">"Coming Soon" Label</label>
            <input
              type="text"
              value={settings.site_coming_soon}
              onChange={e => set('site_coming_soon', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Dropdowns Tab */}
      {tab === 'dropdowns' && (
        <div className="space-y-8">
          {DROPDOWN_GROUPS.map(({ key, label }) => {
            const items = getDropdownItems(key)
            return (
              <section key={key}>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">{label}</h2>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                  {items.map(item => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full"
                    >
                      {item}
                      <button
                        onClick={() => removeDropdownItem(key, item)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {items.length === 0 && (
                    <span className="text-sm text-gray-400 italic">No options — add one below</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add new option…"
                    value={newItems[key] ?? ''}
                    onChange={e => setNewItems(prev => ({ ...prev, [key]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') addDropdownItem(key) }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <button
                    onClick={() => addDropdownItem(key)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* Save */}
      <div className="mt-10 flex items-center gap-3 border-t border-gray-100 pt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition text-sm"
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Saved successfully</span>
        )}
      </div>
    </div>
  )
}
