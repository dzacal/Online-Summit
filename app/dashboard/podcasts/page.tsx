'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Podcast, ResponseStatus } from '@/lib/types'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import { Plus, Pencil, Trash2, Search, ExternalLink, RefreshCw } from 'lucide-react'

const STATUSES: ResponseStatus[] = ['Not Contacted','Outreach Sent','Follow Up Sent','Confirmed','Declined','No Response']
const PODCAST_STATUSES = [...STATUSES, 'Recorded' as any, 'Published' as any]

const emptyForm = {
  podcast_name: '', host_name: '', host_email: '', show_website: '', social_handle: '',
  monthly_listeners: '' as any, audience_niche: '',
  outreach_date: '', outreach_method: '', follow_up_date: '',
  response_status: 'Not Contacted' as ResponseStatus,
  confirmed: false, recording_date: '', recording_format: '',
  publish_date: '', episode_title: '', episode_url: '',
  talking_points: '', assets_sent: false, notes: '',
  rating: '' as any, rep: '', location: '', client_notes: '',
}

export default function PodcastsPage() {
  const supabase = createClient()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Podcast | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => { fetchPodcasts() }, [])

  async function fetchPodcasts() {
    setLoading(true)
    const { data } = await supabase.from('podcasts').select('*').order('podcast_name')
    setPodcasts(data ?? [])
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(p: Podcast) {
    setEditing(p)
    setForm({ ...p, monthly_listeners: p.monthly_listeners ?? '' } as any)
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      monthly_listeners: form.monthly_listeners ? Number(form.monthly_listeners) : null,
      outreach_date: form.outreach_date || null,
      follow_up_date: form.follow_up_date || null,
      recording_date: form.recording_date || null,
      publish_date: form.publish_date || null,
    }
    if (editing) {
      await supabase.from('podcasts').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('podcasts').insert(payload)
    }
    setSaving(false)
    setShowModal(false)
    fetchPodcasts()
  }

  async function handleSyncToSheet() {
    setSyncing(true)
    setSyncMsg('')
    const res = await fetch('/api/sync/to-sheet', { method: 'POST' })
    const json = await res.json()
    if (json.error) {
      setSyncMsg(`Error: ${json.error}`)
    } else {
      setSyncMsg(`Synced! ${json.updated} updated, ${json.added} added to sheet.`)
    }
    setSyncing(false)
    setTimeout(() => setSyncMsg(''), 5000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this podcast?')) return
    await supabase.from('podcasts').delete().eq('id', id)
    fetchPodcasts()
  }

  const filtered = podcasts.filter(p => {
    const matchSearch = `${p.podcast_name} ${p.host_name} ${p.audience_niche}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || p.response_status === filterStatus
    return matchSearch && matchStatus
  })

  const confirmedCount = podcasts.filter(p => p.confirmed).length
  const publishedCount = podcasts.filter(p => p.episode_url).length

  function fld(key: string, label: string, type = 'text', span2 = false) {
    return (
      <div key={key} className={span2 ? 'col-span-2' : ''}>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input type={type} value={(form as any)[key] ?? ''}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Podcast Tracker</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            <span className="text-green-600 font-medium">{confirmedCount} booked</span>
            {publishedCount > 0 && <> · <span className="text-indigo-600 font-medium">{publishedCount} published</span></>}
            {' · '}{podcasts.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncMsg && <span className="text-xs text-gray-500">{syncMsg}</span>}
          <button onClick={handleSyncToSheet} disabled={syncing}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition text-sm disabled:opacity-50">
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync to Sheet'}
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm">
            <Plus size={16} /> Add Podcast
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search podcasts…"
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-60 focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="All">All Statuses</option>
          {PODCAST_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400">No podcasts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Podcast','Host','Listeners','Niche','Status','Recording','Episode',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.podcast_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{p.host_name}</div>
                      <div className="text-xs text-gray-400">{p.host_email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {p.monthly_listeners ? p.monthly_listeners.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{p.audience_niche}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={p.response_status} /></td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.recording_date ?? '—'}</td>
                    <td className="px-4 py-3">
                      {p.episode_url ? (
                        <a href={p.episode_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-brand-600 hover:underline text-xs">
                          <ExternalLink size={12} /> Listen
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">{p.episode_title || '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded transition text-gray-500"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded transition text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Podcast' : 'Add Podcast'} onClose={() => setShowModal(false)}>
          <div className="space-y-5">
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Show Info</p>
              <div className="grid grid-cols-2 gap-3">
                {fld('podcast_name','Podcast Name *','text',true)}
                {fld('host_name','Host Name')}
                {fld('host_email','Host Email','email')}
                {fld('show_website','Show Website','url')}
                {fld('social_handle','Social Handle')}
                {fld('monthly_listeners','Monthly Listeners (est.)','number')}
                {fld('audience_niche','Audience Niche / Focus','text',true)}
              </div>
            </section>
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Outreach</p>
              <div className="grid grid-cols-2 gap-3">
                {fld('outreach_date','Outreach Date','date')}
                {fld('outreach_method','Method')}
                {fld('follow_up_date','Follow Up Date','date')}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.response_status}
                    onChange={e => setForm(p => ({ ...p, response_status: e.target.value as ResponseStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                    {PODCAST_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </section>
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recording & Episode</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {fld('recording_date','Recording Date','date')}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
                  <select value={form.recording_format ?? ''}
                    onChange={e => setForm(p => ({ ...p, recording_format: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                    <option value="">Select…</option>
                    <option>Live</option>
                    <option>Pre-recorded</option>
                  </select>
                </div>
                {fld('publish_date','Publish Date','date')}
                {fld('episode_title','Episode Title')}
                {fld('episode_url','Episode URL','url','true' as any)}
                {fld('talking_points','Talking Points / Angle','text',true)}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.confirmed}
                  onChange={e => setForm(p => ({ ...p, confirmed: e.target.checked }))}
                  className="rounded border-gray-300 text-brand-600" />
                Confirmed
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-2">
                <input type="checkbox" checked={form.assets_sent}
                  onChange={e => setForm(p => ({ ...p, assets_sent: e.target.checked }))}
                  className="rounded border-gray-300 text-brand-600" />
                Assets Sent to Host
              </label>
            </section>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea rows={3} value={form.notes ?? ''}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
            </div>
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Additional Info</p>
              <div className="grid grid-cols-2 gap-3">
                {fld('rep', 'Rep / Account Manager')}
                {fld('location', 'Location')}
                {fld('rating', 'Rating (1–5)', 'number')}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Client Notes</label>
                  <textarea rows={2} value={(form as any).client_notes ?? ''}
                    onChange={e => setForm(p => ({ ...p, client_notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
                </div>
              </div>
            </section>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.podcast_name}
              className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition font-medium">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
