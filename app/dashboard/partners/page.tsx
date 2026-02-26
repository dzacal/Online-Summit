'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Partner, PartnerStatus } from '@/lib/types'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

const STATUSES: PartnerStatus[] = ['Prospecting','In Discussion','Agreement Sent','Confirmed','Active','Completed','Declined']
const TYPES = ['Sponsor','Media Partner','Community Partner','Co-Organizer','In-Kind','Affiliate']

const emptyForm = {
  organization: '', partnership_type: '', primary_contact_name: '', primary_contact_title: '',
  primary_contact_email: '', primary_contact_phone: '', secondary_contact_name: '',
  secondary_contact_email: '', website: '', social_handle: '',
  partnership_status: 'Prospecting' as PartnerStatus,
  agreement_signed: false, agreement_date: '', deliverables: '', our_commitments: '',
  their_commitments: '', logo_received: false, assets_received: false,
  payment_terms: '', partnership_value: '' as any, notes: '',
}

export default function PartnersPage() {
  const supabase = createClient()
  const [partners, setPartners] = useState<Partner[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchPartners() }, [])

  async function fetchPartners() {
    setLoading(true)
    const { data } = await supabase.from('partners').select('*').order('organization')
    setPartners(data ?? [])
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(p: Partner) { setEditing(p); setForm({ ...p, partnership_value: p.partnership_value ?? '' } as any); setShowModal(true) }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      partnership_value: form.partnership_value ? Number(form.partnership_value) : null,
      agreement_date: form.agreement_date || null,
    }
    if (editing) {
      await supabase.from('partners').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('partners').insert(payload)
    }
    setSaving(false)
    setShowModal(false)
    fetchPartners()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this partner?')) return
    await supabase.from('partners').delete().eq('id', id)
    fetchPartners()
  }

  const filtered = partners.filter(p => {
    const matchSearch = `${p.organization} ${p.primary_contact_name} ${p.primary_contact_email}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || p.partnership_status === filterStatus
    const matchType   = filterType === 'All' || p.partnership_type === filterType
    return matchSearch && matchStatus && matchType
  })

  function f(key: string, label: string, type = 'text', span2 = false) {
    return (
      <div key={key} className={span2 ? 'col-span-2' : ''}>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input type={type} value={(form as any)[key] ?? ''}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
      </div>
    )
  }

  function chk(key: string, label: string) {
    return (
      <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={!!(form as any)[key]}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.checked }))}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
        {label}
      </label>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
          <p className="text-gray-500 text-sm mt-0.5">{partners.length} organizations</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-lg transition text-sm">
          <Plus size={16} /> Add Partner
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners…"
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-60 focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="All">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
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
          <p className="p-8 text-center text-gray-400">No partners found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Organization','Type','Primary Contact','Email','Status','Agreement','Value ($)',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.organization}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.partnership_type}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{p.primary_contact_name}</div>
                      <div className="text-xs text-gray-400">{p.primary_contact_title}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.primary_contact_email}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={p.partnership_status} /></td>
                    <td className="px-4 py-3 text-center">{p.agreement_signed ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.partnership_value ? `$${p.partnership_value.toLocaleString()}` : '—'}</td>
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
        <Modal title={editing ? 'Edit Partner' : 'Add Partner'} onClose={() => setShowModal(false)}>
          <div className="space-y-5">
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Organization</p>
              <div className="grid grid-cols-2 gap-3">
                {f('organization','Organization Name *', 'text', true)}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Partnership Type</label>
                  <select value={form.partnership_type ?? ''}
                    onChange={e => setForm(p => ({ ...p, partnership_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                    <option value="">Select…</option>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {f('website','Website')}
                {f('social_handle','Social Handle')}
              </div>
            </section>
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contacts</p>
              <div className="grid grid-cols-2 gap-3">
                {f('primary_contact_name','Primary Contact Name')}
                {f('primary_contact_title','Title')}
                {f('primary_contact_email','Email')}
                {f('primary_contact_phone','Phone')}
                {f('secondary_contact_name','Secondary Contact Name')}
                {f('secondary_contact_email','Secondary Email')}
              </div>
            </section>
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Partnership Details</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.partnership_status}
                    onChange={e => setForm(p => ({ ...p, partnership_status: e.target.value as PartnerStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {f('agreement_date','Agreement Date','date')}
                {f('partnership_value','Value ($)','number')}
                {f('payment_terms','Payment / Exchange Terms')}
                {f('deliverables','Deliverables Agreed','text',true)}
                {f('our_commitments','Our Commitments','text',true)}
                {f('their_commitments','Their Commitments','text',true)}
              </div>
              <div className="flex flex-wrap gap-4">
                {chk('agreement_signed','Agreement Signed')}
                {chk('logo_received','Logo Received')}
                {chk('assets_received','Assets Received')}
              </div>
            </section>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea rows={3} value={form.notes ?? ''}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.organization}
              className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition font-medium">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
