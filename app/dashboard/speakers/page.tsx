'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Speaker, ResponseStatus } from '@/lib/types'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import { Plus, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react'

const STATUSES: ResponseStatus[] = [
  'Not Contacted','Outreach Sent','Follow Up Sent','In Conversation','Confirmed','Declined','No Response'
]
const SESSION_TYPES = ['Keynote','Panel','Workshop','Lightning Talk','Fireside Chat','Interview']

const emptyForm = {
  full_name: '', organization: '', title: '', topic: '', session_type: '',
  contact_email: '', contact_phone: '', agent_name: '', agent_email: '',
  outreach_date: '', outreach_method: '', follow_up_date: '',
  response_status: 'Not Contacted' as ResponseStatus,
  confirmed: false, confirmation_date: '', contract_sent: false, contract_signed: false,
  bio_received: false, headshot_received: false, av_requirements: '',
  session_date: '', session_time_utc: '', session_length_min: '' as any,
  honorarium: '' as any, travel_notes: '', notes: '',
}

export default function SpeakersPage() {
  const supabase = createClient()
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Speaker | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchSpeakers() }, [])

  async function fetchSpeakers() {
    setLoading(true)
    const { data } = await supabase.from('speakers').select('*').order('full_name')
    setSpeakers(data ?? [])
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(s: Speaker) { setEditing(s); setForm({ ...s, session_length_min: s.session_length_min ?? '', honorarium: s.honorarium ?? '' } as any); setShowModal(true) }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      session_length_min: form.session_length_min ? Number(form.session_length_min) : null,
      honorarium: form.honorarium ? Number(form.honorarium) : null,
      outreach_date: form.outreach_date || null,
      follow_up_date: form.follow_up_date || null,
      confirmation_date: form.confirmation_date || null,
      session_date: form.session_date || null,
      session_time_utc: form.session_time_utc || null,
    }
    if (editing) {
      await supabase.from('speakers').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('speakers').insert(payload)
    }
    setSaving(false)
    setShowModal(false)
    fetchSpeakers()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this speaker?')) return
    await supabase.from('speakers').delete().eq('id', id)
    fetchSpeakers()
  }

  const filtered = speakers.filter(s => {
    const matchSearch = `${s.full_name} ${s.organization} ${s.topic} ${s.contact_email}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || s.response_status === filterStatus
    return matchSearch && matchStatus
  })

  const confirmedCount = speakers.filter(s => s.confirmed).length

  function field(key: string, label: string, type = 'text', span2 = false) {
    return (
      <div key={key} className={span2 ? 'col-span-2' : ''}>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input type={type} value={(form as any)[key] ?? ''}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
      </div>
    )
  }

  function check(key: string, label: string) {
    return (
      <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={!!(form as any)[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
        {label}
      </label>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Speakers</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            <span className="text-green-600 font-medium">{confirmedCount} confirmed</span> · {speakers.length} total
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm">
          <Plus size={16} /> Add Speaker
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search speakers…"
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-60 focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400">No speakers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name','Org / Title','Topic','Session Type','Contact','Status','Confirmed','Session Date',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{s.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{s.organization}</div>
                      <div className="text-xs text-gray-400">{s.title}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{s.topic}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.session_type}</td>
                    <td className="px-4 py-3 text-gray-600">{s.contact_email}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.response_status} /></td>
                    <td className="px-4 py-3">
                      {s.confirmed && <CheckCircle2 size={16} className="text-green-500" />}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.session_date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-gray-100 rounded transition text-gray-500"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 rounded transition text-red-400"><Trash2 size={14} /></button>
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
        <Modal title={editing ? 'Edit Speaker' : 'Add Speaker'} onClose={() => setShowModal(false)}>
          <div className="space-y-5">
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Speaker Info</p>
              <div className="grid grid-cols-2 gap-3">
                {field('full_name','Full Name *', 'text', true)}
                {field('organization','Organization')}
                {field('title','Title / Role')}
                {field('topic','Topic / Session Title', 'text', true)}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Session Type</label>
                  <select value={form.session_type ?? ''}
                    onChange={e => setForm(f => ({ ...f, session_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                    <option value="">Select…</option>
                    {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {field('honorarium','Honorarium ($)', 'number')}
              </div>
            </section>
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact</p>
              <div className="grid grid-cols-2 gap-3">
                {field('contact_email','Email')}
                {field('contact_phone','Phone')}
                {field('agent_name','Agent / Rep Name')}
                {field('agent_email','Agent / Rep Email')}
              </div>
            </section>
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Outreach</p>
              <div className="grid grid-cols-2 gap-3">
                {field('outreach_date','Outreach Date','date')}
                {field('outreach_method','Method (email/LinkedIn/…)')}
                {field('follow_up_date','Follow Up Date','date')}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.response_status}
                    onChange={e => setForm(f => ({ ...f, response_status: e.target.value as ResponseStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </section>
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Confirmation & Logistics</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {field('confirmation_date','Confirmation Date','date')}
                {field('session_date','Session Date','date')}
                {field('session_time_utc','Session Time (UTC)','time')}
                {field('session_length_min','Session Length (min)','number')}
                {field('av_requirements','A/V Requirements','text',true)}
                {field('travel_notes','Travel / Accommodation Notes','text',true)}
              </div>
              <div className="flex flex-wrap gap-4">
                {check('confirmed','Confirmed')}
                {check('contract_sent','Contract Sent')}
                {check('contract_signed','Contract Signed')}
                {check('bio_received','Bio Received')}
                {check('headshot_received','Headshot Received')}
              </div>
            </section>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea rows={3} value={form.notes ?? ''}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.full_name}
              className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition font-medium">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
